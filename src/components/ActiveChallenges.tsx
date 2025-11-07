'use client'

import { useState, useEffect } from 'react'
import { supabase, AbstinenceChallenge } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Cigarette, Coffee, Cookie, Candy, Pizza, Wine, Apple, Trophy, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const challengeIcons: Record<string, React.ReactNode> = {
  no_cigarettes: <Cigarette className="h-6 w-6" />,
  no_chips: <Cookie className="h-6 w-6" />,
  no_chocolate: <Candy className="h-6 w-6" />,
  no_sugar: <Apple className="h-6 w-6" />,
  no_fastfood: <Pizza className="h-6 w-6" />,
  no_coffee: <Coffee className="h-6 w-6" />,
  no_alcohol: <Wine className="h-6 w-6" />
}

const challengeColors: Record<string, { bg: string; text: string; progress: string }> = {
  no_cigarettes: { bg: 'bg-red-900/50', text: 'text-red-300', progress: 'bg-red-500' },
  no_chips: { bg: 'bg-orange-900/50', text: 'text-orange-300', progress: 'bg-orange-500' },
  no_chocolate: { bg: 'bg-amber-900/50', text: 'text-amber-300', progress: 'bg-amber-500' },
  no_sugar: { bg: 'bg-pink-900/50', text: 'text-pink-300', progress: 'bg-pink-500' },
  no_fastfood: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', progress: 'bg-yellow-500' },
  no_coffee: { bg: 'bg-stone-900/50', text: 'text-stone-300', progress: 'bg-stone-500' },
  no_alcohol: { bg: 'bg-purple-900/50', text: 'text-purple-300', progress: 'bg-purple-500' }
}

export interface ActiveChallengesProps {
  onChallengeAborted?: () => void
}

export default function ActiveChallenges({ onChallengeAborted }: ActiveChallengesProps) {
  const { user } = useAuthStore()
  const [challenges, setChallenges] = useState<AbstinenceChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [abortingId, setAbortingId] = useState<string | null>(null)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadChallenges = async () => {
      try {
        setLoading(true) // Nur beim ersten Laden!
        const { data } = await supabase
          .from('abstinence_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (data) {
          setChallenges(data)
        }
      } catch (error) {
        console.error('Error loading challenges:', error)
      }
      setLoading(false)
    }

    loadChallenges()
    // eslint-disable-next-line
  }, [user?.id])

  const calculateTimeSince = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return { value: diffDays, unit: diffDays === 1 ? 'Tag' : 'Tage' }
    } else if (diffHours > 0) {
      return { value: diffHours, unit: diffHours === 1 ? 'Stunde' : 'Stunden' }
    } else {
      return { value: diffMinutes, unit: diffMinutes === 1 ? 'Minute' : 'Minuten' }
    }
  }

  const abortChallenge = async (challengeId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId)
      if (!challenge) return
      const confirmAbort = window.confirm(`Möchtest du die Challenge "${challenge.challenge_name}" wirklich abbrechen?`)
      if (!confirmAbort) return
      setAbortingId(challengeId)
      await supabase
        .from('abstinence_challenges')
        .update({
          is_active: false,
          status: 'failed',
          last_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)
      setRemovingIds(prev => new Set([...prev, challengeId]))
      setAbortingId(null)
      if (onChallengeAborted) onChallengeAborted()
    } catch (error) {
      setAbortingId(null)
      console.error('Error aborting challenge:', error)
    }
  }

  const getProgressPercentage = (challenge: AbstinenceChallenge) => {
    const timeSince = calculateTimeSince(challenge.start_date)
    const totalDays = timeSince.unit === 'Tage' ? timeSince.value : timeSince.value / 24
    return Math.min((totalDays / challenge.target_days) * 100, 100)
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <div className="bg-gray-900 rounded-3xl shadow-lg border border-gray-800 p-6">
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Keine aktiven Challenges</h3>
          <p className="text-gray-400 text-sm">Starte eine Challenge, indem du eine Karte nach rechts swipst!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-3xl shadow-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
          Aktive Challenges
        </h3>
        <div className="text-sm text-gray-400">
          {challenges.length} aktiv
        </div>
      </div>
      <div className="space-y-4">
        <AnimatePresence initial={false} onExitComplete={() => {
          if (removingIds.size > 0) {
            setChallenges(prev => prev.filter(c => !removingIds.has(c.id)))
            setRemovingIds(new Set())
          }
        }}>
        {challenges.map((challenge) => {
          const isRemoving = removingIds.has(challenge.id)
          const colors = challengeColors[challenge.challenge_type]
          const icon = challengeIcons[challenge.challenge_type]
          const progressPercentage = getProgressPercentage(challenge)
          const timeSince = calculateTimeSince(challenge.start_date)
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40, transition: { duration: 0.35, ease: 'easeIn' } }}
              animate={{ opacity: 1, y: 0 }}
              // layout removed for performance
              className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-4 flex items-center gap-4 overflow-hidden" style={{willChange: 'transform, opacity'}}>
              {/* Progress Ring + Icon */}
              <div className="relative flex-shrink-0">
                <svg className="w-14 h-14" viewBox="0 0 48 48">
                  <circle
                    cx="24" cy="24" r="20"
                    stroke="#4b5563" strokeWidth="6" fill="none"
                  />
                  <circle
                    cx="24" cy="24" r="20"
                    stroke={colors.progress.replace('bg-', '').replace('-500','') || '#38bdf8'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercentage / 100)}
                    className="transition-all duration-700"
                    strokeLinecap="round"
                    style={{filter:'drop-shadow(0 0 8px #38bdf8aa)'}}
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-gray-900 shadow-lg`}>
                  <span className={`text-xl ${colors.text}`}>{icon}</span>
                </div>
              </div>
              {/* Challenge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-200 truncate">{challenge.challenge_name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 ml-1">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-1 truncate">Abstinent seit {timeSince.value} {timeSince.unit}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Gestartet am {new Date(challenge.start_date).toLocaleDateString('de-DE')}</span>
                  {challenge.longest_streak_days > 0 && (
                    <span className="ml-2">| Längste Serie: {challenge.longest_streak_days} Tage</span>
                  )}
                  {challenge.total_attempts > 1 && (
                    <span className="ml-2">| Versuche: {challenge.total_attempts}</span>
                  )}
                </div>
              </div>
              {/* Action Button oder Spinner */}
              {abortingId === challenge.id ? (
                <div className="ml-2 flex-shrink-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-400 border-t-transparent" />
                </div>
              ) : (
                <button
                  onClick={() => abortChallenge(challenge.id)}
                  className="ml-2 flex-shrink-0 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  title="Challenge abbrechen"
                  disabled={isRemoving}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </motion.div>
          )
        })}
        </AnimatePresence>
      </div>
    </div>
  )
}