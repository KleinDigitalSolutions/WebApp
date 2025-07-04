'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { ChatMessage } from '@/lib/groq-api'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

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
        content: `Hallo! 👋 Ich bin dein KI-Ernährungscoach. Stelle mir Fragen oder fordere eine Analyse deiner Ernährung an.\n\n📊 Ich kann deine letzten 7 Tage auswerten und dir konkrete Tipps geben!\n\nWie kann ich dir helfen? 🌱`,
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
      // Debug: Log API-Call-Daten
      console.log('API-Call /api/chat', {
        apiMessages,
        userProfile: profile,
        userId: user?.id,
      })

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
      content: `Hallo! 👋 Ich bin dein KI-Ernährungscoach. Stelle mir Fragen oder fordere eine Analyse deiner Ernährung an.\n\n📊 Ich kann deine letzten 7 Tage auswerten und dir konkrete Tipps geben!\n\nWie kann ich dir helfen? 🌱`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Liquid Glass Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 60% 10%, #059669cc 0%, #064e3b 60%, #0e172a 100%)',
          filter: 'blur(0px) saturate(1.2)',
          transition: 'background 1s',
        }}
      />
      {/* Subtle animated glass waves */}
      <motion.div
        className="absolute -bottom-24 left-0 w-full h-48 z-0 pointer-events-none"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            'linear-gradient(120deg, #a7f3d0cc 0%, #6ee7b7bb 40%, #05966988 100%)',
          filter: 'blur(32px) saturate(1.3)',
        }}
      />
      {/* Header */}
      <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-2 flex items-center gap-3 z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/30 shadow-lg backdrop-blur-md border border-white/30">
          <span className="text-2xl">🤖</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white drop-shadow">KI Ernährungsberater</h1>
          <p className="text-xs text-emerald-50/80">Stelle Fragen oder starte eine Analyse</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Chat-Container */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col px-2 pt-2 z-10" style={{overflow:'hidden'}}>
        <div
          className="flex-1 flex flex-col gap-2 overflow-y-auto rounded-3xl bg-white/30 shadow-2xl border border-white/30 backdrop-blur-2xl p-4 mb-3"
          style={{
            minHeight: '180px',
            maxHeight: 'calc(100dvh - 320px)', // Weniger Platz für Chat, mehr für Input auf kleinen Screens
            boxShadow: '0 8px 40px 0 #05966933',
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
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shadow border border-emerald-200">
                    <span className="text-lg">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-xl backdrop-blur-2xl border relative ${message.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ml-auto' : 'bg-white/80 text-emerald-900 border-emerald-100'}`}
                  style={message.role === 'user'
                    ? { boxShadow: '0 2px 16px 0 #05966955, 0 0 0 2px #05966933', border: '1.5px solid #05966933', backdropFilter: 'blur(18px) saturate(1.2)' }
                    : { boxShadow: '0 2px 16px 0 #05966922', border: '1.5px solid #a7f3d0', backdropFilter: 'blur(18px) saturate(1.2)' }
                  }
                >
                  {/* Glanz-Overlay */}
                  <div className="absolute left-0 top-0 w-full h-full pointer-events-none rounded-2xl" style={{background:'linear-gradient(120deg,rgba(255,255,255,0.13) 0%,rgba(255,255,255,0.07) 100%)'}} />
                  <div className="whitespace-pre-wrap text-sm leading-relaxed relative z-10">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          strong: (props) => <strong className="text-emerald-700 font-semibold" {...props} />,
                          li: (props) => <li className="ml-4 list-disc" {...props} />,
                          ul: (props) => <ul className="mb-2 ml-2" {...props} />,
                          p: (props) => <p className="mb-2" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-emerald-100' : 'text-emerald-500'}`}>{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow border border-emerald-200">
                    <span className="text-white font-bold">{profile?.first_name?.[0]?.toUpperCase() || 'U'}</span>
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
                className="flex items-end gap-2 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shadow border border-emerald-200">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="px-4 py-3 rounded-2xl shadow-xl bg-white/90 border border-emerald-100 flex items-center gap-2 backdrop-blur-2xl">
                  <span className="animate-bounce text-emerald-500 text-lg">...</span>
                  <span className="text-sm text-emerald-500">KI denkt nach...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide z-10">
          {["📊 7-Tage-Analyse", "⚠️ Problemstellen", "💪 Protein & Nährstoffe", "🍬 Zucker & Snacks", "🥗 Gesunde Alternativen", "📋 Wochenplan", "🎯 Ziel erreichen", "⚖️ Kalorien-Check"].map((q) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 0 4px #05966933' }}
              key={q}
              onClick={()=>setInputMessage(q)}
              className="px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 text-emerald-700 font-medium text-xs shadow border border-emerald-100 transition-colors whitespace-nowrap backdrop-blur-xl"
              style={{boxShadow:'0 2px 8px 0 #05966922'}}
            >{q}</motion.button>
          ))}
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          className="flex items-end gap-2 bg-white/80 rounded-2xl shadow-2xl border border-emerald-100 backdrop-blur-2xl px-4 py-3 relative mb-2"
          style={{boxShadow:'0 8px 32px 0 #05966933'}}
        >
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Frage mich zu Ernährung, Mahlzeiten oder deinen Zielen..."
            className="flex-1 resize-none border-none bg-transparent focus:outline-none text-emerald-900 placeholder-emerald-400 text-sm"
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-100 text-emerald-700 shadow hover:bg-emerald-50 transition-colors"
            style={{boxShadow:'0 0 0 2px #05966922'}}
            aria-label="Chat zurücksetzen"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-sm font-medium">Chat zurücksetzen</span>
          </motion.button>
        </div>
        <p className="text-xs text-emerald-100 mt-2 text-center">Enter zum Senden, Shift+Enter für neue Zeile</p>
      </div>
      <Navigation />
    </div>
  )
}
