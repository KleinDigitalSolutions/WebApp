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
        content: `Hallo! 👋 Ich bin dein persönlicher KI-Ernährungsberater. Ich helfe dir gerne mit evidenzbasierten Ernährungstipps, detaillierter Mahlzeitenanalyse und beantworte alle Fragen zu deiner Ernährung und deinen Gesundheitszielen.

🔍 **Personalisierte Analyse:** Ich kann deine Tagebuch-Einträge der letzten 7 Tage detailliert analysieren und dir konkrete, umsetzbare Verbesserungsvorschläge geben!

📊 **Was ich für dich analysiere:**
• Nährstoffverteilung (Protein, Kohlenhydrate, Fett)
• Mikronährstoffe und Ballaststoffe  
• Essgewohnheiten und -muster
• Potentielle Problembereiche
• Konkrete Verbesserungsvorschläge

${profile?.goal ? `🎯 Ich sehe, dein Ziel ist "${profile.goal.replace('_', ' ')}". Darauf werde ich meine Empfehlungen abstimmen! ` : ''}

Wie kann ich dir heute helfen? 🌱`,
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
          userId: user?.id, // Add user ID for diary analysis
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
      content: `Hallo! 👋 Ich bin dein persönlicher KI-Ernährungsberater. Ich helfe dir gerne mit evidenzbasierten Ernährungstipps, detaillierter Mahlzeitenanalyse und beantworte alle Fragen zu deiner Ernährung und deinen Gesundheitszielen.

🔍 **Personalisierte Analyse:** Ich kann deine Tagebuch-Einträge der letzten 7 Tage detailliert analysieren und dir konkrete, umsetzbare Verbesserungsvorschläge geben!

📊 **Was ich für dich analysiere:**
• Nährstoffverteilung (Protein, Kohlenhydrate, Fett)
• Mikronährstoffe und Ballaststoffe  
• Essgewohnheiten und -muster
• Potentielle Problembereiche
• Konkrete Verbesserungsvorschläge

${profile?.goal ? `🎯 Ich sehe, dein Ziel ist "${profile.goal.replace('_', ' ')}". Darauf werde ich meine Empfehlungen abstimmen! ` : ''}

Wie kann ich dir heute helfen? 🌱`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 w-full px-4 pt-4 pb-20 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg flex flex-col mb-4 relative">
          {/* Floating "Neu starten" Button */}
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 shadow-sm transition-colors"
            >
              ↻ Neu
            </button>
          )}
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">🍎 Ernährungsanalyse starten:</h3>
            <div className="space-y-2">
              {[
                "📊 Analysiere meine Ernährung der letzten 7 Tage detailliert",
                "⚠️ Was esse ich zu viel und was sollte ich reduzieren?",
                "💪 Bekomme ich genug Protein und alle wichtigen Nährstoffe?",
                "🍬 Wie viel Zucker und verarbeitete Lebensmittel esse ich?",
                "🥗 Welche gesunden Alternativen passten zu meinen Gewohnheiten?",
                "📋 Erstelle mir einen Wochenplan basierend auf meiner Analyse",
                "🎯 Wie kann ich mein Ernährungsziel optimal erreichen?",
                "⚖️ Ist meine Kalorienzufuhr für mein Ziel angemessen?",
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="w-full text-left p-4 backdrop-blur-sm bg-green-50/80 rounded-xl text-sm text-green-800 border border-green-100 shadow-sm active:bg-green-100/80 hover:bg-green-100/60 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">💬 Oder frage mich direkt:</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Was sind gesunde Snacks zum Abnehmen?",
                  "Wie kann ich mehr Gemüse in meine Ernährung einbauen?",
                  "Welche Proteinquellen sind am besten?",
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-left p-3 bg-blue-50/80 rounded-lg text-sm text-blue-800 border border-blue-100 hover:bg-blue-100/60 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  )
}
