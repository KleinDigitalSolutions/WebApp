'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Droplet } from 'lucide-react'

type WaterIntake = Database['public']['Tables']['water_intake']['Row']

export const WaterIntakeStats = () => {
  const [waterIntake, setWaterIntake] = useState<WaterIntake[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchWaterIntake = async () => {
      try {
        const { data, error } = await supabase
          .from('water_intake')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(7)

        if (error) throw error
        setWaterIntake(data || [])
      } catch (error) {
        console.error('Error fetching water intake:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWaterIntake()
  }, [supabase])

  const calculateStats = () => {
    if (!waterIntake.length) return { totalIntake: 0, averageIntake: 0, goalProgress: 0 }

    const totalIntake = waterIntake.reduce((sum, entry) => sum + entry.amount_ml, 0)
    const averageIntake = Math.round(totalIntake / waterIntake.length)
    const dailyGoal = 2000 // 2L per day
    const goalProgress = Math.min((totalIntake / dailyGoal) * 100, 100)

    return { totalIntake, averageIntake, goalProgress }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="p-4">Loading water intake stats...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-neutral-800">Wasseraufnahme</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600 font-medium">Gesamt</p>
          <p className="text-2xl font-bold">{stats.totalIntake} ml</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600 font-medium">Durchschnitt</p>
          <p className="text-2xl font-bold">{stats.averageIntake} ml/Tag</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600 font-medium">Tagesziel</p>
          <div className="mt-2 h-2 bg-blue-100 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.goalProgress}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-blue-600">{Math.round(stats.goalProgress)}%</p>
        </div>
      </div>

      {waterIntake.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          Noch keine Wasseraufnahme erfasst
        </p>
      )}
    </div>
  )
} 