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
        content: `Hello! I'm your AI nutrition coach. I'm here to help you with personalized nutrition advice, meal planning, and answering any questions about your diet and health goals.

${profile?.goal ? `I see your goal is to ${profile.goal.replace('_', ' ')}. ` : ''}How can I assist you today?`,
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
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
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
      content: `Hello! I'm your AI nutrition coach. I'm here to help you with personalized nutrition advice, meal planning, and answering any questions about your diet and health goals.

${profile?.goal ? `I see your goal is to ${profile.goal.replace('_', ' ')}. ` : ''}How can I assist you today?`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Nutrition Coach</h1>
            <p className="text-gray-600">Get personalized nutrition advice and support</p>
          </div>
          {messages.length > 1 && (
            <Button variant="outline" onClick={clearChat}>
              Clear Chat
            </Button>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
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
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about nutrition, meal planning, or your dietary goals..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                rows={2}
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="self-end"
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "What should I eat to reach my daily protein goals?",
                "Can you suggest a healthy meal plan for this week?",
                "How can I track my macronutrients effectively?",
                "What are some healthy snack options for weight loss?",
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
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
