'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

type Activity = Database['public']['Tables']['activities']['Row']

export const ActivityStats = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setActivities(data || [])
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  const calculateStats = () => {
    if (!activities.length) return { totalCalories: 0, totalDuration: 0, favoriteActivity: null }

    const totalCalories = activities.reduce((sum, activity) => sum + activity.calories_burned, 0)
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration_minutes, 0)

    // Find most frequent activity
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteActivity = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    return { totalCalories, totalDuration, favoriteActivity }
  }

  const stats = calculateStats()

  if (loading) {
    return <div className="p-4">Loading activity stats...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Aktivitätsstatistik</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-orange-600 font-medium">Verbrannte Kalorien</p>
          <p className="text-2xl font-bold">{stats.totalCalories} kcal</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600 font-medium">Gesamtdauer</p>
          <p className="text-2xl font-bold">{stats.totalDuration} min</p>
        </div>
        
        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-emerald-600 font-medium">Häufigste Aktivität</p>
          <p className="text-2xl font-bold">{stats.favoriteActivity || 'N/A'}</p>
        </div>
      </div>

      {activities.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          Noch keine Aktivitäten erfasst
        </p>
      )}
    </div>
  )
} 