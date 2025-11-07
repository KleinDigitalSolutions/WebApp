'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore, useDiaryStore } from '@/store'
import { calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'
import { PlusCircle, Calendar, ChevronRight } from 'lucide-react'

export default function NutritionOverview() {
  const router = useRouter()
  const { user, profile, setProfile } = useAuthStore()
  const { dailyGoals, setEntries, setDailyGoals } = useDiaryStore()
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<DiaryEntry[]>([])
  const [waterIntake, setWaterIntake] = useState(0)
  const [waterGoal, setWaterGoal] = useState(2000)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Profil und Ziele laden (falls noch nicht im Store)
      if (!profile) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profileData) {
          setProfile(profileData)
          const calorieGoal = calculateDailyCalorieGoal(profileData)
          const macroTargets = calculateMacroTargets(calorieGoal)
          setDailyGoals({
            calories: calorieGoal,
            protein: macroTargets.protein,
            carbs: macroTargets.carbs,
            fat: macroTargets.fat
          })
        }
      }

      // Heutige Einträge laden
      const today = new Date().toISOString().split('T')[0]
      const { data: entries } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)

      if (entries) {
        setTodayEntries(entries)
        setEntries(entries)
      }

      // Wasserzufuhr laden
      const response = await fetch(`/api/water?userId=${user.id}&date=${today}`)
      const data = await response.json()
      if (response.ok) {
        setWaterIntake(data.amount_ml || 0)
        setWaterGoal(data.daily_goal_ml || 2000)
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, profile, setProfile, setDailyGoals, setEntries])

  useEffect(() => {
    loadData()
  }, [loadData])

  const consumedCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const consumedProtein = todayEntries.reduce((sum, entry) => sum + entry.protein_g, 0)
  const consumedCarbs = todayEntries.reduce((sum, entry) => sum + entry.carb_g, 0)
  const consumedFat = todayEntries.reduce((sum, entry) => sum + entry.fat_g, 0)
  const consumedFiber = todayEntries.reduce((sum, entry) => sum + (entry.fiber_g || 0), 0)
  const consumedSugar = todayEntries.reduce((sum, entry) => sum + (entry.sugar_g || 0), 0)
  const consumedSodium = todayEntries.reduce((sum, entry) => sum + (entry.sodium_mg || 0), 0)

  const calorieProgress = dailyGoals.calories ? (consumedCalories / dailyGoals.calories) * 100 : 0
  const waterProgress = waterGoal ? (waterIntake / waterGoal) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* Quick Stats Card */}
      <div 
        className="relative bg-cover bg-center rounded-3xl shadow-lg p-6 text-white overflow-hidden"
        style={{ backgroundImage: "url('/2.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tagesübersicht</h2>
            <div className="flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 mr-1" />
              Heute
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mb-6">
            {/* Calorie Ring */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
                  <circle
                    cx="50" cy="50" r="45" stroke="url(#calorieGradient)" strokeWidth="6" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(calorieProgress, 100) / 100)}`}
                    className="transition-all duration-500 ease-out" strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(consumedCalories)}</span>
                  <span className="text-xs font-semibold text-gray-300">kcal</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="text-xs font-semibold text-gray-400">von {dailyGoals.calories}</div>
              </div>
            </div>

            {/* Water Ring */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-700" />
                  <circle
                    cx="50" cy="50" r="45" stroke="url(#waterGradient)" strokeWidth="6" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(waterProgress, 100) / 100)}`}
                    className="transition-all duration-500 ease-out" strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(waterIntake / 100) / 10}L</span>
                  <span className="text-xs font-semibold text-gray-300">Wasser</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="text-xs font-semibold text-gray-400">von {waterGoal / 1000}L</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Protein', value: Math.round(consumedProtein) + 'g', color: '#3b82f6' },
              { label: 'Kohlenhydrate', value: Math.round(consumedCarbs) + 'g', color: '#f59e42' },
              { label: 'Fett', value: Math.round(consumedFat) + 'g', color: '#f472b6' },
              { label: 'Ballaststoffe', value: Math.round(consumedFiber) + 'g', color: '#10b981' },
              { label: 'Zucker', value: Math.round(consumedSugar) + 'g', color: '#a78bfa' },
              { label: 'Natrium', value: Math.round(consumedSodium) + 'mg', color: '#facc15' },
            ].map((macro) => (
              <div key={macro.label} className="text-center p-3 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/0 shadow-none">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',margin:'auto'}}>
                      <circle cx="14" cy="14" r="11" stroke={macro.color} strokeWidth="2.5" fill="none" />
                      <circle cx="14" cy="14" r="5.5" fill={macro.color} />
                    </svg>
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-100">{macro.value}</div>
                <div className="text-xs text-gray-400">{macro.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Meals */}
      <div className="bg-zinc-900 rounded-3xl shadow-lg border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Heutige Mahlzeiten</h3>
          <button 
            onClick={() => router.push('/diary')}
            className="flex items-center text-emerald-400 font-medium text-sm"
          >
            Alle anzeigen
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        {todayEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm">Noch keine Mahlzeiten eingetragen</p>
            <button 
              onClick={() => router.push('/diary/add')}
              className="mt-3 text-emerald-400 font-medium text-sm"
            >
              Erste Mahlzeit hinzufügen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-2xl">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-200">{entry.food_name}</h4>
                  <p className="text-sm text-gray-400">{entry.calories} kcal</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
