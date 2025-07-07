import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ReactNode } from 'react';
import { FaFireAlt, FaCrown, FaRunning, FaBiking, FaSwimmer, FaWalking, FaDumbbell, FaHeartbeat, FaInfoCircle, FaChevronRight } from 'react-icons/fa'

interface Activity {
  activity_name: string
  duration_min: number
  calories: number
  note?: string
  activity_date: string
}

interface CaloriesBurnedDetailProps {
  userId: string
  month: number
  year: number
}

export default function CaloriesBurnedDetail({ userId, month, year }: CaloriesBurnedDetailProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true)
      setError(null)
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`
      const toDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_name, duration_min, calories, note, activity_date')
        .eq('user_id', userId)
        .gte('activity_date', fromDate)
        .lt('activity_date', toDate)
        .order('activity_date', { ascending: true })
      if (error) setError(error.message)
      else setActivities(data || [])
      setLoading(false)
    }
    fetchActivities()
  }, [userId, month, year])

  // Gruppiere nach Tag
  const grouped = activities.reduce<Record<string, { total: number; acts: Activity[] }>>((acc, act) => {
    if (!acc[act.activity_date]) acc[act.activity_date] = { total: 0, acts: [] }
    acc[act.activity_date].total += act.calories
    acc[act.activity_date].acts.push(act)
    return acc
  }, {})

  // Top-Aktivitäten berechnen
  const activityTotals: Record<string, number> = {}
  activities.forEach(a => {
    activityTotals[a.activity_name] = (activityTotals[a.activity_name] || 0) + a.calories
  })
  const topActivities = Object.entries(activityTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // Icon-Mapping für Aktivitäten
  const activityIcons: Record<string, ReactNode> = {
    'Joggen': <FaRunning className="inline mr-1 text-emerald-300" />, // Beispiel
    'Laufen': <FaWalking className="inline mr-1 text-emerald-300" />,
    'Aerobic Dancing': <FaHeartbeat className="inline mr-1 text-pink-300" />,
    'Crosstrainer': <FaDumbbell className="inline mr-1 text-orange-300" />,
    'Radfahren': <FaBiking className="inline mr-1 text-yellow-300" />,
    'Schwimmen': <FaSwimmer className="inline mr-1 text-blue-300" />,
    // ...weitere Zuordnungen...
  }

  if (loading) return <div className="rounded-3xl p-6 bg-zinc-900/90 text-white shadow-xl backdrop-blur-xl border border-white/20">Lade Aktivitäten...</div>
  if (error) return <div className="text-red-500 bg-zinc-900/90 rounded-3xl p-4 shadow-xl backdrop-blur-xl border border-white/20">Fehler: {error}</div>
  if (Object.keys(grouped).length === 0) return <div className="rounded-3xl p-6 bg-zinc-900/90 text-white shadow-xl backdrop-blur-xl border border-white/20">Keine Aktivitäten für diesen Monat.</div>

  return (
    <div className="rounded-3xl p-6 bg-zinc-950/90 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
      <h3 className="font-bold mb-4 text-2xl text-emerald-200 flex items-center gap-2"><FaFireAlt className="text-amber-400" /> Tagesübersicht Kalorienverbrauch</h3>
      <div className="mb-3 text-emerald-200 text-sm flex items-center gap-2">
        <FaInfoCircle className="text-emerald-300" /> Tipp: Tippe auf einen Tag für mehr Details.
      </div>
      {/* Mobile Card-Ansicht */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, { total, acts }]) => (
            <div
              key={date}
              className="rounded-2xl bg-zinc-900/90 p-4 flex items-center gap-3 shadow-md border border-emerald-900/60 active:scale-[0.98] active:bg-emerald-700/80 transition cursor-pointer"
              onClick={() => {/* Modal/Details öffnen */}}
            >
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-lg text-white">{date}</span>
                  <FaInfoCircle className="text-emerald-300 text-lg" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xl text-amber-300">{total} kcal</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {acts.map(a => (
                    <span key={a.activity_name + a.duration_min} className="inline-flex items-center bg-emerald-950/90 rounded-xl px-3 py-1 text-sm font-semibold text-white shadow border border-emerald-900/60">
                      {activityIcons[a.activity_name] || <FaDumbbell className="inline mr-1 text-emerald-300" />} {a.activity_name}
                    </span>
                  ))}
                </div>
              </div>
              <FaChevronRight className="text-emerald-300 text-2xl ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:block">
        {/* Desktop/Table Ansicht */}
        <div className="overflow-x-auto">
          <table className="w-full text-base border-separate border-spacing-y-2 mb-6">
            <thead>
              <tr className="bg-emerald-950/90 text-emerald-100">
                <th className="p-3 rounded-l-2xl font-semibold text-lg">Datum</th>
                <th className="p-3 font-semibold text-lg">Kalorien</th>
                <th className="p-3 rounded-r-2xl font-semibold text-lg">Aktivitäten</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([date, { total, acts }]) => (
                <tr
                  key={date}
                  className="hover:bg-emerald-800/90 hover:scale-[1.025] transition rounded-2xl cursor-pointer group min-h-14"
                  // onClick={() => ...}
                >
                  <td className="p-3 font-mono text-lg text-white bg-zinc-900/80 rounded-l-2xl flex items-center gap-2 min-h-14">
                    {date}
                    <FaInfoCircle className="ml-2 text-emerald-300 text-lg group-hover:text-amber-400 transition" />
                  </td>
                  <td className="p-3 font-bold text-xl text-amber-300 bg-zinc-900/80">{total}</td>
                  <td className="p-3 flex flex-wrap gap-2 bg-zinc-900/80 rounded-r-2xl">
                    {acts.map(a => (
                      <span key={a.activity_name + a.duration_min} className="inline-flex items-center bg-emerald-950/90 rounded-xl px-3 py-1 text-sm font-semibold text-white shadow border border-emerald-900/60">
                        {activityIcons[a.activity_name] || <FaDumbbell className="inline mr-1 text-emerald-300" />} {a.activity_name}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <h4 className="font-semibold mt-6 mb-2 text-lg text-emerald-200 flex items-center gap-2"><FaCrown className="text-yellow-400" /> Top-Aktivitäten</h4>
      <ul className="space-y-2">
        {topActivities.map(([name, kcal]) => (
          <li key={name} className="flex items-center gap-3 text-base font-semibold text-white">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/90 shadow text-xl border border-emerald-900/60">
              {activityIcons[name] || <FaDumbbell className="text-emerald-300" />}
            </span>
            <span className="font-bold text-white">{name}</span>
            <span className="ml-auto text-amber-300 font-bold">{kcal} kcal</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
