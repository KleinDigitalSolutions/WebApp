'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Clock, Play, Square, Timer } from 'lucide-react'

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

export default function FastingCard() {
  const { user } = useAuthStore()
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [targetDuration, setTargetDuration] = useState(16)

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
          setTargetDuration(data[0].target_duration_hours || 16)
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

  const startFasting = async () => {
    if (!user?.id) {
      alert('Kein Benutzer angemeldet!')
      return
    }

    try {
      console.log('Starting fasting...')
      
      const insertData = {
        user_id: user.id,
        plan: `${targetDuration}:${24 - targetDuration}`,
        start_time: new Date().toISOString(),
        is_active: true,
        target_duration_hours: targetDuration,
        status: 'active',
        fasting_type: targetDuration === 16 ? 'intermittent_16_8' : 'custom'
      }
      
      console.log('Insert data:', insertData)

      const { data, error } = await supabase
        .from('fasting_sessions')
        .insert(insertData)
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        alert('Fehler beim Erstellen: ' + error.message)
        return
      }

      if (data && data.length > 0) {
        setCurrentSession(data[0])
        alert('Fasten gestartet!')
      } else {
        alert('Keine Daten zurückerhalten')
      }
    } catch (error) {
      console.error('Start error:', error)
      alert('Unerwarteter Fehler: ' + error)
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
    const targetSeconds = targetDuration * 3600
    return Math.min((timeElapsed / targetSeconds) * 100, 100)
  }

  if (loading) {
    return (
      <div className="bg-emerald-100/80 rounded-3xl p-6 shadow-lg border border-emerald-200/60">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-emerald-100/80 rounded-3xl p-6 shadow-lg border border-emerald-200/60">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Timer className="h-5 w-5 mr-2 text-purple-600" />
          Fasten
        </h3>
        
        {!currentSession && (
          <select
            value={targetDuration}
            onChange={(e) => setTargetDuration(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1"
          >
            <option value={16}>16h (16:8)</option>
            <option value={18}>18h (18:6)</option>
            <option value={20}>20h (20:4)</option>
            <option value={24}>24h</option>
          </select>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
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
            {currentSession ? (
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

        <div className="text-center space-y-4">
          {currentSession ? (
            <>
              <div className="text-sm text-gray-600">Ziel: {targetDuration} Stunden</div>
              <button
                onClick={endFasting}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
              >
                <Square className="h-5 w-5 mr-2" />
                Beenden
              </button>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600">{targetDuration} Stunden Fasten</div>
              <button
                onClick={startFasting}
                className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
              >
                <Play className="h-5 w-5 mr-2" />
                Fasten starten
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}