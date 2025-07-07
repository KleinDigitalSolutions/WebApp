import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaFireAlt, FaAppleAlt } from 'react-icons/fa';

interface DiaryEntry {
  entry_date: string
  calories: number
  food_name: string
}

interface CaloriesIntakeDetailProps {
  userId: string
  month: number // 1-12
  year: number
}

export default function CaloriesIntakeDetail({ userId, month, year }: CaloriesIntakeDetailProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true)
      setError(null)
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`
      const toDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const { data, error } = await supabase
        .from('diary_entries')
        .select('entry_date, calories, food_name')
        .eq('user_id', userId)
        .gte('entry_date', fromDate)
        .lt('entry_date', toDate)
        .order('entry_date', { ascending: true })
      if (error) setError(error.message)
      else setEntries(data || [])
      setLoading(false)
    }
    fetchEntries()
  }, [userId, month, year])

  // Gruppiere Einträge nach Tag
  const grouped = entries.reduce<Record<string, { total: number; foods: string[] }>>((acc, entry) => {
    if (!acc[entry.entry_date]) acc[entry.entry_date] = { total: 0, foods: [] }
    acc[entry.entry_date].total += entry.calories
    acc[entry.entry_date].foods.push(entry.food_name)
    return acc
  }, {})

  // Top-Lebensmittel berechnen
  const foodTotals: Record<string, number> = {}
  entries.forEach(e => {
    foodTotals[e.food_name] = (foodTotals[e.food_name] || 0) + e.calories
  })
  const topFoods = Object.entries(foodTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (loading) return <div className="rounded-3xl p-6 bg-zinc-900/90 text-white shadow-xl backdrop-blur-xl border border-white/20">Lade Kalorienübersicht...</div>
  if (error) return <div className="text-red-500 bg-zinc-900/90 rounded-3xl p-4 shadow-xl backdrop-blur-xl border border-white/20">Fehler: {error}</div>
  if (Object.keys(grouped).length === 0) return <div className="rounded-3xl p-6 bg-zinc-900/90 text-white shadow-xl backdrop-blur-xl border border-white/20">Keine Einträge für diesen Monat.</div>

  return (
    <div className="rounded-3xl p-6 bg-emerald-950/90 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
      <h3 className="font-bold mb-4 text-2xl text-emerald-200 flex items-center gap-2"><FaFireAlt className="text-amber-400" /> Tagesübersicht Kalorienaufnahme</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-base border-separate border-spacing-y-2 mb-6">
          <thead>
            <tr className="bg-emerald-950/90 text-emerald-100">
              <th className="p-3 rounded-l-2xl font-semibold text-lg">Datum</th>
              <th className="p-3 font-semibold text-lg">Kalorien</th>
              <th className="p-3 rounded-r-2xl font-semibold text-lg">Top-Lebensmittel</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([date, { total, foods }]) => (
              <tr key={date} className="hover:bg-emerald-900/70 transition rounded-2xl">
                <td className="p-3 font-mono text-lg text-white bg-zinc-900/80 rounded-l-2xl">{date}</td>
                <td className="p-3 font-bold text-xl text-amber-300 bg-zinc-900/80">{total}</td>
                <td className="p-3 flex flex-wrap gap-2 bg-zinc-900/80 rounded-r-2xl">
                  {foods.slice(0, 3).map((food, i) => (
                    <span key={food + i} className="inline-flex items-center bg-emerald-950/90 rounded-xl px-3 py-1 text-sm font-semibold text-white shadow border border-emerald-900/60">
                      <FaAppleAlt className="inline mr-1 text-emerald-300" /> {food}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="font-semibold mt-6 mb-2 text-lg text-emerald-200 flex items-center gap-2"><FaAppleAlt className="text-emerald-300" /> Top-Lebensmittel</h4>
      <ul className="space-y-2">
        {topFoods.map(([name, kcal]) => (
          <li key={name} className="flex items-center gap-3 text-base font-semibold text-white">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/90 shadow text-xl border border-emerald-900/60">
              <FaAppleAlt className="text-emerald-300" />
            </span>
            <span className="font-bold text-white">{name}</span>
            <span className="ml-auto text-amber-300 font-bold">{kcal} kcal</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
