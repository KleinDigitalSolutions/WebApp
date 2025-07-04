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
  no_cigarettes: { bg: 'bg-red-100', text: 'text-red-600', progress: 'bg-red-500' },
  no_chips: { bg: 'bg-orange-100', text: 'text-orange-600', progress: 'bg-orange-500' },
  no_chocolate: { bg: 'bg-amber-100', text: 'text-amber-600', progress: 'bg-amber-500' },
  no_sugar: { bg: 'bg-pink-100', text: 'text-pink-600', progress: 'bg-pink-500' },
  no_fastfood: { bg: 'bg-yellow-100', text: 'text-yellow-600', progress: 'bg-yellow-500' },
  no_coffee: { bg: 'bg-stone-100', text: 'text-stone-600', progress: 'bg-stone-500' },
  no_alcohol: { bg: 'bg-purple-100', text: 'text-purple-600', progress: 'bg-purple-500' }
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
      <div className="bg-emerald-100/80 rounded-3xl p-6 shadow-lg border border-emerald-200/60">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <div className="relative rounded-3xl border border-white/30 shadow-2xl p-6 bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-white/60 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Keine aktiven Challenges</h3>
          <p className="text-white/80 text-sm">Starte eine Challenge indem du eine Karte nach rechts swipst!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-3xl border border-white/30 shadow-2xl p-6 bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-300" />
          Aktive Challenges
        </h3>
        <div className="text-sm text-white/80">
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
              className="relative bg-white/20 rounded-2xl p-4 border border-white/20 shadow-xl backdrop-blur-2xl flex items-center gap-4 overflow-hidden"
              style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)', willChange: 'transform, opacity'}}>
              {/* Progress Ring + Icon */}
              <div className="relative flex-shrink-0">
                <svg className="w-14 h-14" viewBox="0 0 48 48">
                  <circle
                    cx="24" cy="24" r="20"
                    stroke="#e0e7ef" strokeWidth="6" fill="none"
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
                <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md shadow-lg`} style={{boxShadow:'0 0 0 4px #fff4'}}>
                  <span className={`text-xl ${colors.text}`}>{icon}</span>
                </div>
              </div>
              {/* Challenge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white truncate">{challenge.challenge_name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 text-white/80 ml-1">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="text-xs text-white/80 mb-1 truncate">Abstinent seit {timeSince.value} {timeSince.unit}</div>
                <div className="flex items-center gap-2 text-xs text-white/60">
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
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-white border-t-transparent" />
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