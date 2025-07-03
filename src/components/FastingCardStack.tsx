'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Clock, Play, Square, Timer, ChevronLeft, ChevronRight } from 'lucide-react'

interface FastingSession {
  id: string
  user_id: string
  plan: string
  start_time: string
  end_time: string | null
  is_active: boolean
  target_duration_hours: number
  status: string
  fasting_type: string
  notes: string | null
  created_at: string
  updated_at: string
}

const fastingTypes = [
  {
    id: 'intermittent_16_8',
    name: '16:8',
    duration: 16,
    description: '16h fasten, 8h essen'
  },
  {
    id: 'intermittent_18_6',
    name: '18:6',
    duration: 18,
    description: '18h fasten, 6h essen'
  },
  {
    id: 'intermittent_20_4',
    name: '20:4',
    duration: 20,
    description: '20h fasten, 4h essen'
  },
  {
    id: 'custom_24',
    name: '24h',
    duration: 24,
    description: 'Ganztägiges Fasten'
  }
]

export default function FastingCardStack() {
  const { user } = useAuthStore()
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Load active session
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadSession = async () => {
      try {
        const { data } = await supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('start_time', { ascending: false })
          .limit(1)

        if (data && data.length > 0) {
          setCurrentSession(data[0])
          const sessionType = fastingTypes.findIndex(t => t.duration === data[0].target_duration_hours)
          if (sessionType !== -1) {
            setActiveCardIndex(sessionType)
          }
        }
      } catch (error) {
        console.error('Load error:', error)
      }
      setLoading(false)
    }

    loadSession()
  }, [user?.id])

  // Timer
  useEffect(() => {
    if (!currentSession?.start_time) return

    const interval = setInterval(() => {
      const now = Date.now()
      const start = new Date(currentSession.start_time).getTime()
      const elapsed = Math.floor((now - start) / 1000)
      setTimeElapsed(Math.max(0, elapsed))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSession?.start_time])

  const startFasting = async (type: typeof fastingTypes[0]) => {
    if (!user?.id) return

    try {
      const insertData = {
        user_id: user.id,
        plan: `${type.duration}:${24 - type.duration}`,
        start_time: new Date().toISOString(),
        is_active: true,
        target_duration_hours: type.duration,
        status: 'active',
        fasting_type: type.id
      }

      const { data, error } = await supabase
        .from('fasting_sessions')
        .insert(insertData)
        .select()

      if (error) {
        alert('Fehler: ' + error.message)
        return
      }

      if (data && data.length > 0) {
        setCurrentSession(data[0])
      }
    } catch (error) {
      console.error('Start error:', error)
    }
  }

  const endFasting = async () => {
    if (!currentSession?.id) return

    try {
      await supabase
        .from('fasting_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false,
          status: 'completed'
        })
        .eq('id', currentSession.id)

      setCurrentSession(null)
      setTimeElapsed(0)
    } catch (error) {
      console.error('End error:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!currentSession) return 0
    const targetSeconds = currentSession.target_duration_hours * 3600
    return Math.min((timeElapsed / targetSeconds) * 100, 100)
  }

  const nextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % fastingTypes.length)
  }

  const prevCard = () => {
    setActiveCardIndex((prev) => (prev - 1 + fastingTypes.length) % fastingTypes.length)
  }

  if (loading) {
    return (
      <div className="bg-emerald-100/80 rounded-3xl p-6 shadow-lg border border-emerald-200/60">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const currentType = fastingTypes[activeCardIndex]
  const isActiveSession = currentSession && currentSession.target_duration_hours === currentType.duration

  return (
    <div className="bg-emerald-100/80 rounded-3xl p-6 shadow-lg border border-emerald-200/60">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Timer className="h-5 w-5 mr-2 text-purple-600" />
          Fasten
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={prevCard}
            className="p-2 rounded-full hover:bg-emerald-200/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex space-x-1">
            {fastingTypes.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeCardIndex ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextCard}
            className="p-2 rounded-full hover:bg-emerald-200/50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Karten Container */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 min-h-[300px]">
        
        {/* Progress Circle */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#8b5cf6"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={283}
                strokeDashoffset={283 * (1 - getProgress() / 100)}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isActiveSession ? (
                <>
                  <span className="text-xl font-bold text-gray-900">{formatTime(timeElapsed)}</span>
                  <span className="text-xs text-gray-500">{Math.round(getProgress())}%</span>
                </>
              ) : (
                <>
                  <Clock className="h-8 w-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Bereit</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="text-center space-y-6">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">{currentType.name}</h4>
            <p className="text-gray-600">{currentType.description}</p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            {isActiveSession ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={endFasting}
                  className="flex items-center justify-center px-8 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-lg"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => startFasting(currentType)}
                  className="flex items-center justify-center px-8 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          Nutze die Pfeile um zwischen den Fasten-Arten zu wechseln
        </p>
      </div>
    </div>
  )
}