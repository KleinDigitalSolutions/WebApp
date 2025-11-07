'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Clock, Play, Square, Timer, ChevronLeft, ChevronRight } from 'lucide-react'
import TinderCard from 'react-tinder-card'

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

// Farbzuordnung für Fastenarten (angepasst auf Brandfarben)
const fastingColors = [
  {
    progress: '#34A0A4', // brand6
    indicator: 'bg-brand6',
    button: 'bg-brand6 hover:bg-brand7',
    card: 'bg-brand6',
    border: 'border-brand7/60',
  },
  {
    progress: '#76C893', // brand4
    indicator: 'bg-brand4',
    button: 'bg-brand4 hover:bg-brand2',
    card: 'bg-brand4',
    border: 'border-brand5/60',
  },
  {
    progress: '#1A759F', // brand8
    indicator: 'bg-brand8',
    button: 'bg-brand8 hover:bg-brand6',
    card: 'bg-brand8',
    border: 'border-brand9/60',
  },
  {
    progress: '#184E77', // brand10
    indicator: 'bg-brand10',
    button: 'bg-brand10 hover:bg-brand8',
    card: 'bg-brand10',
    border: 'border-brand9/60',
  },
]

export default function FastingCardStack() {
  const { user } = useAuthStore()
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(false)
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
    if (currentSession) return // Verhindere Doppelstart
    setButtonLoading(true)
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
      setButtonLoading(false)
      if (error) {
        alert('Fehler: ' + error.message)
        return
      }
      if (data && data.length > 0) {
        setCurrentSession(data[0])
        const idx2 = fastingTypes.findIndex(t => t.duration === data[0].target_duration_hours)
        if (idx2 !== -1) setActiveCardIndex(idx2)
      }
    } catch (error) {
      setButtonLoading(false)
      if (typeof error === 'object' && error && 'message' in error) {
        alert('Fehler: ' + (error as { message: string }).message)
      } else {
        alert('Fehler: ' + String(error))
      }
    }
  }

  const endFasting = async () => {
    if (!currentSession?.id) return
    setButtonLoading(true)
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
      setActiveCardIndex(0)
      setButtonLoading(false)
    } catch (error) {
      setButtonLoading(false)
      if (typeof error === 'object' && error && 'message' in error) {
        alert('Fehler: ' + (error as { message: string }).message)
      } else {
        alert('Fehler: ' + String(error))
      }
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
      <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-zinc-800">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const currentType = fastingTypes[activeCardIndex]
  const color = fastingColors[activeCardIndex]
  const isActiveSession = currentSession && currentSession.target_duration_hours === currentType.duration

  return (
    <div className="bg-zinc-900 rounded-3xl shadow-lg border border-zinc-800 p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center">
          <Timer className="h-5 w-5 mr-2" style={{color: color.progress}} />
          Fasten
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevCard}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div className="flex space-x-1">
            {fastingTypes.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === activeCardIndex ? color.indicator : 'bg-zinc-600'}`}
              />
            ))}
          </div>
          <button
            onClick={nextCard}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Swipebare Karten-Container */}
      <div className="flex justify-center">
        <TinderCard
          key={currentType.id}
          onSwipe={dir => {
            if (dir === 'left') nextCard()
            if (dir === 'right') prevCard()
          }}
          flickOnSwipe={true}
          swipeRequirementType="position"
          swipeThreshold={120}
          preventSwipe={['up', 'down']}
        >
          <div
            className={
              `relative rounded-3xl p-8 shadow-2xl min-h-[300px] flex flex-col items-center justify-center`
            }
            style={{
              minWidth: '320px',
              maxWidth: '400px',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)',
              background: getFastingCardGradientHex(activeCardIndex)
            }}
          >
            {/* Hochglanz-Overlay */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-10">
              <div className="absolute left-0 top-0 w-full h-1/2 rounded-t-3xl bg-white/30 blur-[2px] opacity-60" />
              <div className="absolute right-0 bottom-0 w-2/3 h-1/3 rounded-br-3xl bg-white/10 blur-[2px] opacity-40" />
              <div className="absolute left-0 top-0 w-full h-full rounded-3xl border border-white/30" />
            </div>
            {/* Progress Circle */}
            <div className="flex flex-col items-center mb-8 relative z-20">
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
                    stroke={color.progress}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={283}
                    strokeDashoffset={283 * (1 - (currentSession && currentSession.target_duration_hours === currentType.duration ? getProgress() / 100 : 0))}
                    className={currentSession && currentSession.target_duration_hours === currentType.duration && activeCardIndex === fastingTypes.findIndex(t => t.duration === currentSession.target_duration_hours) ? "transition-all duration-1000" : undefined}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isActiveSession ? (
                    <>
                      <span className="text-xl font-bold text-white drop-shadow-lg">{formatTime(timeElapsed)}</span>
                      <span className="text-xs text-white/80 drop-shadow">{Math.round(getProgress())}%</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-8 w-8 text-white/80 mb-1 drop-shadow" />
                      <span className="text-xs text-white/70">Bereit</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Card Info */}
            <div className="text-center space-y-6 relative z-20">
              <div>
                <h4 className="text-2xl font-bold text-white drop-shadow-lg mb-2">{currentType.name}</h4>
                <p className="text-white/90 drop-shadow">{currentType.description}</p>
              </div>
            </div>
          </div>
        </TinderCard>
      </div>
      {/* Buttons jetzt außerhalb der swipebaren Karte */}
      <div className="flex justify-center mt-4">
        {isActiveSession ? (
          <button
            onClick={endFasting}
            className={`flex items-center justify-center px-8 py-3 text-white rounded-lg font-medium transition-colors shadow-lg ${color.button} relative`}
            style={{background: color.progress, borderColor: color.progress, pointerEvents: 'auto'}}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <span className="absolute left-2 animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        ) : (
          <button
            onClick={() => startFasting(currentType)}
            className={`flex items-center justify-center px-8 py-3 text-white rounded-lg font-medium transition-colors shadow-lg ${color.button} relative`}
            style={{background: color.progress, borderColor: color.progress, pointerEvents: 'auto'}}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <span className="absolute left-2 animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Nutze die Pfeile oder Swipe um zwischen den Fasten-Arten zu wechseln
        </p>
      </div>

      {/* Tailwind Safelist für dynamische Farben (damit die Kartenfarben wirklich gebaut werden): */}
      <div className="hidden bg-indigo-600 bg-amber-500 bg-sky-600 bg-pink-600" />
    </div>
  )
}

// Am Ende der Datei:
function getFastingCardGradientHex(idx: number) {
  switch (idx) {
    case 0: // 16:8
      return 'linear-gradient(135deg, #34A0A4 0%, #76C893 60%, #B5E48C 100%)'; // brand6, brand4, brand2
    case 1: // 18:6
      // Satteres Grün, weniger Weiß: brand4 -> brand3 -> brand2
      return 'linear-gradient(135deg, #76C893 0%, #99D98C 60%, #B5E48C 100%)'; // brand4, brand3, brand2
    case 2: // 20:4
      return 'linear-gradient(135deg, #1A759F 0%, #34A0A4 60%, #76C893 100%)'; // brand8, brand6, brand4
    case 3: // 24h
      return 'linear-gradient(135deg, #184E77 0%, #1A759F 60%, #34A0A4 100%)'; // brand10, brand8, brand6
    default:
      return 'linear-gradient(135deg, #76C893 0%, #34A0A4 100%)';
  }
}