'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Apple } from 'lucide-react'

type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']

export const NutritionStats = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('diary_entries')
          .select('*')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)

        if (error) throw error
        setEntries(data || [])
      } catch (error) {
        console.error('Error fetching diary entries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [supabase])

  const calculateStats = () => {
    if (!entries.length) return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      calorieGoalProgress: 0
    }

    const stats = entries.reduce((acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein_g,
      carbs: acc.carbs + entry.carb_g,
      fat: acc.fat + entry.fat_g
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    })

    const calorieGoal = 2000 // Example goal
    const calorieGoalProgress = Math.min((stats.calories / calorieGoal) * 100, 100)

    return { ...stats, calorieGoalProgress }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="p-4">Loading nutrition stats...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <Apple className="w-6 h-6 text-emerald-600" />
        <h2 className="text-lg font-semibold text-neutral-800">Ernährung</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-emerald-600 font-medium">Kalorien</p>
          <p className="text-2xl font-bold">{stats.calories} kcal</p>
          <div className="mt-2 h-2 bg-emerald-100 rounded-full">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.calorieGoalProgress}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-emerald-600">{Math.round(stats.calorieGoalProgress)}%</p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-emerald-600 font-medium">Protein</p>
          <p className="text-2xl font-bold">{Math.round(stats.protein)}g</p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-emerald-600 font-medium">Kohlenhydrate</p>
          <p className="text-2xl font-bold">{Math.round(stats.carbs)}g</p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-emerald-600 font-medium">Fett</p>
          <p className="text-2xl font-bold">{Math.round(stats.fat)}g</p>
        </div>
      </div>

      {entries.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          Noch keine Mahlzeiten erfasst
        </p>
      )}
    </div>
  )
} 