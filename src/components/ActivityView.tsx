'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, UserActivity } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import ActivitiesCard from '@/components/ActivitiesCard' // Die Karte zum Hinzufügen

export default function ActivityView() {
  const { user } = useAuthStore()
  const [todayActivities, setTodayActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  const loadTodayActivities = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .order('created_at', { ascending: false })

      if (activities) {
        setTodayActivities(activities)
      }
    } catch (error) {
      console.error('Error loading today activities:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTodayActivities()
  }, [loadTodayActivities])

  return (
    <div className="space-y-6 p-4">
      {/* Heutige Aktivitäten */}
      <div 
        className="relative bg-cover bg-center rounded-3xl shadow-lg p-6 text-white overflow-hidden"
        style={{ backgroundImage: "url('/3.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Heutige Aktivitäten</h3>
          </div>
          {loading ? (
            <div className="text-center py-6 text-gray-300 text-sm">Lade Aktivitäten...</div>
          ) : todayActivities.length === 0 ? (
            <div className="text-center py-6 text-gray-300 text-sm">Noch keine Aktivitäten für heute eingetragen.</div>
          ) : (
            <div className="space-y-3">
              {todayActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{act.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-100">{act.activity_name}</div>
                      <div className="text-xs text-gray-300">{act.duration_min} min • {act.calories} kcal</div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {act.note && <div className="italic">{act.note}</div>}
                    <div>{new Date(act.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Karte zum Hinzufügen neuer Aktivitäten */}
      <ActivitiesCard />
    </div>
  )
}
