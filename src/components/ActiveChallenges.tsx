'use client'

import { useState, useEffect } from 'react'
import { supabase, AbstinenceChallenge } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Cigarette, Coffee, Cookie, Candy, Pizza, Wine, Apple, Trophy, Target } from 'lucide-react'

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

interface ActiveChallengesProps {
  onChallengeAborted?: () => void
}

export default function ActiveChallenges({ onChallengeAborted }: ActiveChallengesProps) {
  const { user } = useAuthStore()
  const [challenges, setChallenges] = useState<AbstinenceChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const loadChallenges = async () => {
      try {
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

      await supabase
        .from('abstinence_challenges')
        .update({
          is_active: false,
          status: 'failed',
          last_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)

      // Remove from local state
      setChallenges(prev => prev.filter(c => c.id !== challengeId))

      // Notify parent component that a challenge was aborted
      if (onChallengeAborted) {
        onChallengeAborted()
      }

    } catch (error) {
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
        {challenges.map((challenge) => {
          const colors = challengeColors[challenge.challenge_type]
          const icon = challengeIcons[challenge.challenge_type]
          const progressPercentage = getProgressPercentage(challenge)
          const timeSince = calculateTimeSince(challenge.start_date)
          return (
            <div key={challenge.id} className="bg-white/30 rounded-2xl p-4 border border-white/20 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`${colors.text}`}>{icon}</div>
                  <div>
                    <h4 className="font-semibold text-white">{challenge.challenge_name}</h4>
                    <p className="text-sm text-white/80">
                      Abstinent seit {timeSince.value} {timeSince.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {timeSince.value}
                  </div>
                  <div className="text-xs text-white/60">{timeSince.unit}</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Fortschritt zum {challenge.target_days}-Tage-Ziel</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-3">
                  <div 
                    className={`${colors.progress} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-white/60 mt-1">
                  Gestartet am {new Date(challenge.start_date).toLocaleDateString('de-DE')}
                </div>
              </div>
              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => abortChallenge(challenge.id)}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Challenge abbrechen
                </button>
              </div>
              {/* Stats */}
              {challenge.longest_streak_days > 0 && (
                <div className="mt-3 pt-3 border-t border-white/30">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Längste Serie: {challenge.longest_streak_days} Tage</span>
                    <span>Versuche: {challenge.total_attempts}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}