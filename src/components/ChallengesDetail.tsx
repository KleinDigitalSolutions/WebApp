import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaTrophy } from 'react-icons/fa'

interface Challenge {
  challenge_name: string
  status: string
  created_at: string
}

interface ChallengesDetailProps {
  userId: string
  month: number
  year: number
}

export default function ChallengesDetail({ userId, month, year }: ChallengesDetailProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChallenges() {
      setLoading(true)
      setError(null)
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`
      const toDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const { data, error } = await supabase
        .from('abstinence_challenges')
        .select('challenge_name, status, created_at')
        .eq('user_id', userId)
        .gte('created_at', `${fromDate}T00:00:00`)
        .lt('created_at', `${toDate}T00:00:00`)
        .order('created_at', { ascending: true })
      if (error) setError(error.message)
      else setChallenges(data || [])
      setLoading(false)
    }
    fetchChallenges()
  }, [userId, month, year])

  if (loading) return <div className="rounded-3xl p-6 bg-zinc-900/90 text-white shadow-xl backdrop-blur-xl border border-white/20">Lade Challenges...</div>
  if (error) return <div className="text-red-500 bg-zinc-900/90 rounded-3xl p-4 shadow-xl backdrop-blur-xl border border-white/20">Fehler: {error}</div>
  if (challenges.length === 0) return <div className="rounded-3xl p-6 bg-zinc-900/90 text-white shadow-xl backdrop-blur-xl border border-white/20">Keine Challenges für diesen Monat.</div>

  const completedCount = challenges.filter(c => c.status === 'completed').length

  return (
    <div className="rounded-3xl p-6 bg-emerald-950/90 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
      <h3 className="font-bold mb-4 text-2xl text-emerald-200 flex items-center gap-2"><FaTrophy className="text-yellow-400" /> Challenges</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-base border-separate border-spacing-y-2 mb-6">
          <thead>
            <tr className="bg-emerald-950/90 text-emerald-100">
              <th className="p-3 rounded-l-2xl font-semibold text-lg">Titel</th>
              <th className="p-3 rounded-r-2xl font-semibold text-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((c, i) => (
              <tr key={i} className={c.status === 'completed' ? 'bg-emerald-900/70 font-bold rounded-2xl' : 'rounded-2xl'}>
                <td className="p-3 text-white bg-zinc-900/80 rounded-l-2xl">{c.challenge_name}</td>
                <td className="p-3 bg-zinc-900/80 rounded-r-2xl">
                  {c.status === 'completed' ? <span className="inline-flex items-center text-green-300 font-bold"><FaTrophy className="mr-1" /> Abgeschlossen</span> : <span className="inline-flex items-center text-yellow-200"><FaTrophy className="mr-1 opacity-60" /> Offen</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center bg-emerald-950/90 rounded-xl px-3 py-1 text-base font-semibold text-white shadow border border-emerald-900/60">
          <FaTrophy className="inline mr-2 text-yellow-400" /> Abgeschlossene Challenges: <span className="ml-2 font-bold">{completedCount}</span>
        </span>
      </div>
    </div>
  )
}
