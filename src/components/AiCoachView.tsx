'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

// Frontend-ChatMessage erlaubt 'user' | 'assistant'
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
interface ChatMessageWithId extends ChatMessage {
  id: string
  timestamp: Date
}

// Hilfsfunktionen für Rollen-Mapping
function toApiRole(role: string): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user'
}

export default function AiCoachView() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessageWithId[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      // In einer Komponente nicht mehr umleiten
      return
    }

    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessageWithId = {
        id: 'welcome',
        role: 'assistant',
        content: `Hallo! 👋 Ich bin dein KI-Ernährungscoach. Stelle mir Fragen oder fordere eine Analyse deiner Ernährung an.\n\n📊 Ich kann deine letzten 7 Tage auswerten und dir konkrete Tipps geben!\n\nWie kann ich dir helfen? 🌱`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [user, profile, messages.length])

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
      const apiMessages: { role: 'user' | 'model'; content: string }[] = messages
        .filter(m => m.id !== 'welcome')
        .map(({ role, content }) => ({ role: toApiRole(role), content }))
        .concat([{ role: 'user', content: inputMessage }])
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userProfile: profile,
          userId: user?.id,
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
    const welcomeMessage: ChatMessageWithId = {
      id: 'welcome',
      role: 'assistant',
      content: `Hallo! 👋 Ich bin dein KI-Ernährungscoach. Stelle mir Fragen oder fordere eine Analyse deiner Ernährung an.\n\n📊 Ich kann deine letzten 7 Tage auswerten und dir konkrete Tipps geben!\n\nWie kann ich dir helfen? 🌱`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  if (!user) {
    return <div className="p-4 text-center text-gray-600">Bitte einloggen, um den KI-Coach zu nutzen.</div>
  }

  return (
    <div className="flex flex-col relative overflow-hidden bg-black p-4">
      {/* Chat-Container */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col z-10">
        <div
          className="flex-1 flex flex-col gap-2 overflow-y-auto rounded-3xl shadow-lg border border-gray-800 p-4 mb-3"
          style={{
            background: '#111827', // bg-gray-900
            minHeight: '180px',
            maxHeight: 'calc(100dvh - 400px)', // Angepasste Höhe
            boxShadow: '0 8px 40px 0 rgba(0,0,0,0.2)',
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25, type: 'spring', bounce: 0.2 }}
                className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' ? (
                  <div className="flex items-end gap-1">
                    <img src="/SVG/gesicht.svg" alt="KI Gesicht" className="w-16 h-16 object-contain m-0 p-0" style={{display:'block'}} />
                    <div className="flex-1 max-w-[75%] px-4 py-3 rounded-2xl shadow-xl border relative bg-gray-800 text-gray-200 border-gray-700" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.2)'}}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed relative z-10">
                        <ReactMarkdown
                          components={{
                            strong: (props) => <strong className="text-emerald-400 font-semibold" {...props} />,
                            li: (props) => <li className="ml-4 list-disc" {...props} />,
                            ul: (props) => <ul className="mb-2 ml-2" {...props} />,
                            p: (props) => <p className="mb-2" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <div className="text-xs mt-2 text-gray-500">{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-2 justify-end">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl shadow-xl border relative bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ml-auto border-emerald-700" style={{ boxShadow: '0 2px 16px 0 rgba(16,185,129,0.3)'}}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed relative z-10">
                        {message.content}
                      </div>
                      <div className="text-xs mt-2 text-emerald-100">{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow border border-emerald-500 ml-2">
                      <span className="text-white font-bold">{profile?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25, type: 'spring', bounce: 0.2 }}
                className="flex items-end gap-4 justify-start"
              >
                <img src="/SVG/gesicht.svg" alt="KI Gesicht" className="w-16 h-16 min-w-[4rem] min-h-[4rem] object-contain flex-shrink-0" />
                <div className="flex-1 max-w-[75%] px-8 py-6 rounded-2xl shadow-xl bg-gray-800 border border-emerald-800 flex items-center gap-2">
                  <span className="animate-bounce text-emerald-400 text-lg">...</span>
                  <span className="text-sm text-emerald-400">KI denkt nach...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 z-10">
          {["📊 7-Tage-Analyse", "⚠️ Problemstellen", "💪 Protein & Nährstoffe", "🍬 Zucker & Snacks", "🥗 Gesunde Alternativen", "📋 Wochenplan", "🎯 Ziel erreichen", "⚖️ Kalorien-Check"].map((q) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 0 4px #05966933' }}
              key={q}
              onClick={()=>setInputMessage(q)}
              className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-emerald-300 font-medium text-xs shadow border border-gray-700 transition-colors whitespace-nowrap"
              style={{boxShadow:'0 2px 8px 0 #00000033'}}>
              {q}
            </motion.button>
          ))}
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          className="flex items-end gap-2 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 px-4 py-3 relative mb-2"
          style={{boxShadow:'0 8px 32px 0 #00000044'}}
        >
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Frage mich zu Ernährung, Mahlzeiten oder deinen Zielen..."
            className="flex-1 resize-none border-none bg-transparent focus:outline-none text-gray-200 placeholder-gray-500 text-sm"
            rows={1}
            disabled={loading}
            style={{minHeight:'36px',maxHeight:'80px'}}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow transition-colors disabled:opacity-50 relative"
            aria-label="Senden"
            style={{boxShadow:'0 0 0 4px #05966933'}}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        </motion.div>
        <div className="flex flex-col items-center mb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-300 shadow hover:bg-gray-700 transition-colors"
            style={{boxShadow:'0 0 0 2px #00000022'}}
            aria-label="Chat zurücksetzen"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-sm font-medium">Chat zurücksetzen</span>
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Enter zum Senden, Shift+Enter für neue Zeile</p>
      </div>
    </div>
  )
}
