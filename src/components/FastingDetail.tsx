import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaMoon } from 'react-icons/fa'

interface FastingSession {
  start_time: string
  end_time: string
}

interface FastingDetailProps {
  userId: string
  month: number
  year: number
}

function getDurationHours(start: string, end: string) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60 / 60
}

export default function FastingDetail({ userId, month, year }: FastingDetailProps) {
  const [sessions, setSessions] = useState<FastingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true)
      setError(null)
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`
      const toDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .gte('start_time', `${fromDate}T00:00:00`)
        .lt('start_time', `${toDate}T00:00:00`)
        .order('start_time', { ascending: true })
      if (error) setError(error.message)
      else setSessions(data || [])
      setLoading(false)
    }
    fetchSessions()
  }, [userId, month, year])

  if (loading) return <div className="rounded-3xl p-6 bg-zinc-900 text-gray-400 shadow-xl backdrop-blur-xl border border-zinc-800">Lade Fasten-Sessions...</div>
  if (error) return <div className="text-red-400 bg-zinc-900 rounded-3xl p-4 shadow-xl backdrop-blur-xl border border-zinc-800">Fehler: {error}</div>
  if (sessions.length === 0) return <div className="rounded-3xl p-6 bg-zinc-900 text-gray-400 shadow-xl backdrop-blur-xl border border-zinc-800">Keine Fasten-Sessions für diesen Monat.</div>

  const sessionDetails = sessions.map(s => ({
    start: s.start_time.split('T')[0],
    duration: s.end_time ? getDurationHours(s.start_time, s.end_time) : 0
  }))
  const longest = Math.max(...sessionDetails.map(s => s.duration))

  return (
    <div className="rounded-3xl p-6 bg-zinc-900 text-white shadow-2xl border border-zinc-800 backdrop-blur-xl">
      <h3 className="font-bold mb-4 text-2xl text-emerald-300 flex items-center gap-2"><FaMoon className="text-blue-300" /> Fasten-Sessions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-base border-separate border-spacing-y-2 mb-6">
          <thead>
            <tr className="text-zinc-300">
              <th className="p-3 font-semibold text-lg text-left">Start</th>
              <th className="p-3 font-semibold text-lg text-left">Dauer (h)</th>
            </tr>
          </thead>
          <tbody>
            {sessionDetails.map((s, i) => (
              <tr key={i} className={s.duration === longest ? 'bg-zinc-800/70 font-bold rounded-2xl' : 'rounded-2xl'}>
                <td className="p-3 font-mono text-lg text-white bg-zinc-800/80 rounded-l-2xl">{s.start}</td>
                <td className="p-3 font-bold text-xl text-blue-200 bg-zinc-800/80 rounded-r-2xl">{s.duration.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center bg-zinc-800 rounded-xl px-3 py-1 text-base font-semibold text-white shadow border border-zinc-700">
          <FaMoon className="inline mr-2 text-blue-300" /> Längste Session: <span className="ml-2 font-bold">{longest.toFixed(1)} h</span>
        </span>
      </div>
    </div>
  )
}
