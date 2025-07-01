'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, LoadingSpinner } from '@/components/ui'
import { ChatMessage } from '@/lib/groq-api'

interface ChatMessageWithId extends ChatMessage {
  id: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessageWithId[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessageWithId = {
        id: 'welcome',
        role: 'assistant',
        content: `Hallo! Ich bin dein KI-Ernährungsberater. Ich helfe dir gerne mit personalisierten Ernährungstipps, Mahlzeitenplanung und beantworte alle Fragen zu deiner Ernährung und deinen Gesundheitszielen.

${profile?.goal ? `Ich sehe, dein Ziel ist ${profile.goal.replace('_', ' ')}. ` : ''}Wie kann ich dir heute helfen?`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [user, router, profile, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage: ChatMessageWithId = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      // Convert messages to API format (exclude id and timestamp)
      const apiMessages: ChatMessage[] = messages
        .filter(m => m.id !== 'welcome') // Exclude welcome message from context
        .map(({ role, content }) => ({ role, content }))
        .concat([{ role: 'user', content: inputMessage }])

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userProfile: profile,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const aiMessage: ChatMessageWithId = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessageWithId = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    // Re-add welcome message
    const welcomeMessage: ChatMessageWithId = {
      id: 'welcome',
      role: 'assistant',
      content: `Hallo! Ich bin dein KI-Ernährungsberater. Ich helfe dir gerne mit personalisierten Ernährungstipps, Mahlzeitenplanung und beantworte alle Fragen zu deiner Ernährung und deinen Gesundheitszielen.

${profile?.goal ? `Ich sehe, dein Ziel ist ${profile.goal.replace('_', ' ')}. ` : ''}Wie kann ich dir heute helfen?`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      
      <div className="flex-1 w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KI-Ernährungsberater</h1>
            <p className="text-gray-600 text-sm">Personalisierte Ernährungstipps & Beratung</p>
          </div>
          {messages.length > 1 && (
            <Button variant="outline" onClick={clearChat} className="text-sm">
              Neu starten
            </Button>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg flex flex-col mb-4">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-green-50'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 text-gray-900 px-4 py-3 rounded-2xl border border-green-50">
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm">KI denkt nach...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-green-100 p-4">
            <div className="flex space-x-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Frage mich zu Ernährung, Mahlzeiten oder deinen Zielen..."
                className="flex-1 resize-none border border-green-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white text-sm"
                rows={2}
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="self-end px-6 py-3 text-sm"
              >
                Senden
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter zum Senden, Shift+Enter für neue Zeile
            </p>
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Vorschläge:</h3>
            <div className="space-y-2">
              {[
                "Was soll ich essen, um meine Proteinziele zu erreichen?",
                "Kannst du mir einen gesunden Wochenplan erstellen?",
                "Wie verfolge ich meine Makronährstoffe am besten?",
                "Welche gesunden Snacks helfen beim Abnehmen?",
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="w-full text-left p-4 backdrop-blur-sm bg-green-50/80 rounded-xl text-sm text-green-800 border border-green-100 shadow-sm active:bg-green-100/80"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
