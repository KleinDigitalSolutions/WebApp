'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  } from 'lucide-react'
import ActivitiesCard from '@/components/ActivitiesCard'
import { calculateDailyCalorieGoal } from '@/lib/nutrition-utils'

// Meal types with recommended calories
const mealDistribution = {
  breakfast: 0.25, // 25%
  lunch: 0.35,     // 35%
  dinner: 0.3,     // 30%
  snack: 0.1       // 10%
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export default function DiaryPage() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Tagesbedarf berechnen (Fallback 2000)
  const calorieGoal = profile ? calculateDailyCalorieGoal(profile) : 2000

  // Dynamische Mahlzeitenliste
  const mealTypes = [
    {
      key: 'breakfast',
      label: 'Frühstück',
      recommendedCalories: Math.round(calorieGoal * mealDistribution.breakfast),
      image: '/SVG/Fruestuck.webp',
      gradient: 'from-orange-400 to-red-400'
    },
    {
      key: 'lunch',
      label: 'Mittagessen',
      recommendedCalories: Math.round(calorieGoal * mealDistribution.lunch),
      image: '/SVG/Mittagessen.webp',
      gradient: 'from-green-400 to-emerald-400'
    },
    {
      key: 'dinner',
      label: 'Abendessen',
      recommendedCalories: Math.round(calorieGoal * mealDistribution.dinner),
      image: '/SVG/Abendessen.webp',
      gradient: 'from-blue-400 to-purple-400'
    },
    {
      key: 'snack',
      label: 'Snack',
      recommendedCalories: Math.round(calorieGoal * mealDistribution.snack),
      image: '/SVG/Snacks.webp',
      gradient: 'from-pink-400 to-rose-400'
    }
  ]

  const loadEntries = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const { data } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: false })

      if (data) {
        setEntries(data)
      }
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user, selectedDate])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEntries()
  }, [user, router, loadEntries])

  // Group entries by meal type
  const groupedEntries = entries.reduce((acc, entry) => {
    const meal = entry.meal_type || 'other'
    if (!acc[meal]) acc[meal] = []
    acc[meal].push(entry)
    return acc
  }, {} as Record<string, DiaryEntry[]>)

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(selectedDate.getDate() - 1)
    } else {
      newDate.setDate(selectedDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => changeDate('prev')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-800">
                {selectedDate.toLocaleDateString('de-DE', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>
            <button 
              onClick={() => changeDate('next')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={selectedDate.toDateString() === new Date().toDateString()}
            >
              <ChevronRight className={`h-5 w-5 ${
                selectedDate.toDateString() === new Date().toDateString() 
                  ? 'text-gray-300' 
                  : 'text-gray-600'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Water Tracker */}
      <WaterTracker selectedDate={selectedDate} />

      {/* Meal Planning Interface */}
      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {mealTypes.map((mealType, idx) => {
              const mealEntries = groupedEntries[mealType.key] || []
              const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0)

              // Beispiel-Gradient von uigradients.com (z.B. #43cea2 → #185a9d)
              const gradients = [
                'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', // Frühstück
                'linear-gradient(135deg, #ffaf7b 0%, #d76d77 100%)', // Mittagessen
                'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', // Abendessen
                'linear-gradient(135deg, #76c893 0%, #34a0a4 100%)', // Snack (statt pink jetzt grün/türkis)
              ]
              const cardGradient = gradients[idx] || gradients[0]

              return (
                <div key={mealType.key} className="relative rounded-3xl overflow-hidden shadow-xl border-none" style={{ background: cardGradient, boxShadow: '0 8px 32px 0 rgba(52, 160, 164, 0.18), 0 1.5px 8px 0 #34A0A4' }}>
                  {/* Glossy Overlay */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 100%)',
                    pointerEvents: 'none',
                    borderTopLeftRadius: 24, borderTopRightRadius: 24
                  }} />
                  {/* Card Content */}
                  <div className="relative p-4 z-10">
                    <div className="flex items-center justify-between">
                      {/* Meal Info with Image */}
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={mealType.image}
                              alt={mealType.label}
                              width={64}
                              height={64}
                              style={{ objectFit: 'contain', width: 64, height: 64 }}
                              loading={mealType.key === 'breakfast' ? 'eager' : 'lazy'}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white drop-shadow-lg">{mealType.label}</h3>
                          <p className="text-sm text-white/80 drop-shadow">empfohlen {mealType.recommendedCalories} kcal</p>
                        </div>
                      </div>
                      {/* Add Button */}
                      <button 
                        onClick={() => router.push(`/diary/add?meal=${mealType.key}`)}
                        className="w-12 h-12 bg-white hover:bg-gray-100 text-emerald-600 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg border border-white/80"
                      >
                        <Plus className="h-6 w-6" />
                      </button>
                    </div>
                    {/* Show added entries if any */}
                    {mealEntries.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/30">
                        <div className="text-sm text-white/90 mb-2 drop-shadow">
                          Hinzugefügt: {mealCalories} kcal
                        </div>
                        <div className="space-y-2">
                          {mealEntries.slice(0, 3).map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between text-sm">
                              <span className="text-white/95 drop-shadow">{entry.food_name}</span>
                              <span className="text-white/70 drop-shadow">{entry.calories} kcal</span>
                            </div>
                          ))}
                          {mealEntries.length > 3 && (
                            <div className="text-xs text-white/70">
                              +{mealEntries.length - 3} weitere Einträge
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Aktivitäten Sektion: Nur noch Icon-Auswahl-Container */}
            <ActivitiesCard />
          </>
        )}
      </div>
    </div>
  )
}

// Water Tracker Component
function WaterTracker({ selectedDate }: { selectedDate: Date }) {
  const { user } = useAuthStore()
  const [waterIntake, setWaterIntake] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(2000) // 2L = 2000ml
  const [glassSize] = useState(250) // Standard glass size in ml
  const [saving, setSaving] = useState(false)
  const [userWeight, setUserWeight] = useState(70) // kg
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate')
  const [showSettings, setShowSettings] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const dateKey = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD format
  
  // Smart daily goal calculation
  const calculateSmartGoal = useCallback(() => {
    let baseGoal = userWeight * 35 // Basic calculation: 35ml per kg body weight
    
    // Activity level multiplier
    const activityMultiplier = {
      sedentary: 1.0,
      light: 1.2,
      moderate: 1.4,
      active: 1.6
    }
    
    baseGoal *= activityMultiplier[activityLevel]
    
    // Weather adjustment (simplified - in real app would use weather API)
    const today = new Date()
    const isWinter = today.getMonth() >= 10 || today.getMonth() <= 2
    const weatherMultiplier = isWinter ? 0.9 : 1.1
    
    baseGoal *= weatherMultiplier
    
    return Math.round(baseGoal)
  }, [userWeight, activityLevel])
  
  // Drink type multipliers for hydration effectiveness
  const drinkMultipliers = {
    water: 1.0,
    tea: 0.85,
    coffee: 0.7,
    juice: 0.8
  }

  // Load water intake for the selected date from Supabase
  const loadWaterIntake = useCallback(async () => {
    if (!user) return

    try {
      setSaving(true)
      const response = await fetch(`${API_BASE_URL}/api/water?userId=${user.id}&date=${dateKey}`)
      const data = await response.json()
      
      if (response.ok) {
        setWaterIntake(data.amount_ml || 0)
        const smartGoal = calculateSmartGoal()
        setDailyGoal(data.daily_goal_ml || smartGoal)
        // setStreak(data.streak || 0) // Commented out as streak is read-only
        setUserWeight(data.user_weight || 70)
        setActivityLevel(data.activity_level || 'moderate')
        setAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error('Error loading water intake:', error)
    } finally {
      setSaving(false)
    }
  }, [user, dateKey, calculateSmartGoal])

  // Save water intake to Supabase
  const saveWaterIntake = useCallback(async (amount: number) => {
    if (!user || saving) return

    try {
      setSaving(true)
      
      // Calculate new achievements
      const newAchievements = [...achievements]
      if (amount >= dailyGoal && !achievements.includes('daily_goal')) {
        newAchievements.push('daily_goal')
      }
      if (amount >= dailyGoal * 1.5 && !achievements.includes('overachiever')) {
        newAchievements.push('overachiever')
      }
      
      const response = await fetch(`${API_BASE_URL}/api/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          date: dateKey,
          amount_ml: amount,
          daily_goal_ml: dailyGoal
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save water intake')
      }
      
      setAchievements(newAchievements)
    } catch (error) {
      console.error('Error saving water intake:', error)
    } finally {
      setSaving(false)
    }
  }, [user, dateKey, dailyGoal, saving, achievements, userWeight, activityLevel])

  // Load data when component mounts or date changes
  useEffect(() => {
    loadWaterIntake()
  }, [loadWaterIntake])
  
  // Notification system
  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window)) return
    
    const checkHydrationReminder = () => {
      const hoursSinceLastDrink = 2 // Simplified - in real app track actual time
      const currentPercentage = Math.min((waterIntake / dailyGoal) * 100, 100)
      
      if (currentPercentage < 50 && hoursSinceLastDrink >= 2) {
        if (Notification.permission === 'granted') {
          new Notification('💧 Hydration Reminder', {
            body: `Du hast erst ${waterIntake}ml getrunken. Zeit für etwas Wasser!`,
            icon: '/water-icon.png',
            badge: '/water-badge.png'
          })
        }
      }
    }
    
    const intervalId = setInterval(checkHydrationReminder, 60000 * 60) // Check every hour
    return () => clearInterval(intervalId)
  }, [notificationsEnabled, waterIntake, dailyGoal])
  
  const percentage = Math.min((waterIntake / dailyGoal) * 100, 100)
  
  const addWater = async (amount: number, type: string = 'water') => {
    const effectiveAmount = amount * drinkMultipliers[type as keyof typeof drinkMultipliers]
    const newAmount = Math.min(waterIntake + effectiveAmount, dailyGoal + 1000)
    setWaterIntake(newAmount)
    await saveWaterIntake(newAmount)
  }
  
  const removeWater = async () => {
    const newAmount = Math.max(waterIntake - glassSize, 0)
    setWaterIntake(newAmount)
    await saveWaterIntake(newAmount)
  }

  const resetWater = async () => {
    setWaterIntake(0)
    await saveWaterIntake(0)
  }
  
  return (
    <div className="mx-4 mt-4 mb-4">
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl border-none mb-4"
        style={{
          background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(52, 160, 164, 0.18), 0 1.5px 8px 0 #34A0A4'
        }}
      >
        {/* Glossy Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 100%)',
          pointerEvents: 'none',
          borderTopLeftRadius: 24, borderTopRightRadius: 24
        }} />
        {/* Card Content */}
        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">💧</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white drop-shadow-lg">Wasser</h3>
                <p className="text-sm text-white/80 drop-shadow">{waterIntake}ml / {dailyGoal}ml</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={resetWater}
                disabled={saving}
                className="p-2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          {/* Animierter Fortschritt (Wave) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white drop-shadow">{Math.round(percentage)}%</span>
              <span className="text-sm text-white/80 drop-shadow">{dailyGoal - waterIntake}ml verbleibend</span>
            </div>
            {/* Simple SVG Wave als Platzhalter für animierte Lösung */}
            <div className="w-full h-8 relative overflow-hidden rounded-full bg-white/20">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute left-0 top-0 w-full h-full">
                <path d="M0 10 Q 25 0 50 10 T 100 10 V20 H0Z" fill="#fff" fillOpacity="0.7" />
              </svg>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${percentage}%`,
                height: '100%',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: 9999,
                transition: 'width 0.5s cubic-bezier(.4,2,.6,1)',
              }} />
            </div>
          </div>
          {/* Quick Add Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[250, 500, 750, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className="p-2 bg-white/30 hover:bg-white/50 rounded-lg text-center transition-colors active:scale-95 text-white font-bold border border-white/40 shadow"
              >
                <span className="text-lg block mb-1">💧</span>
                <div className="text-xs font-medium">{amount}ml</div>
              </button>
            ))}
          </div>
          {/* Control Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={removeWater}
              disabled={waterIntake === 0 || saving}
              className="flex-1 p-2 bg-white/20 hover:bg-white/40 disabled:bg-white/10 disabled:text-white/40 text-white rounded-lg font-medium transition-colors active:scale-95 text-sm shadow"
            >
              - {glassSize}ml
            </button>
            <button
              onClick={() => addWater(glassSize)}
              disabled={saving}
              className="flex-1 p-2 bg-white/40 hover:bg-white/60 disabled:bg-white/20 text-emerald-700 rounded-lg font-medium transition-colors active:scale-95 text-sm shadow"
            >
              + {glassSize}ml
            </button>
          </div>
          {/* Achievement */}
          {waterIntake >= dailyGoal && (
            <div className="mt-3 p-2 bg-white/30 border border-white/40 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🎉</span>
                <p className="text-sm font-medium text-white drop-shadow">Tagesziel erreicht!</p>
              </div>
            </div>
          )}
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-3 p-3 bg-white/60 rounded-lg border border-white/40">
              <h4 className="text-white font-medium mb-3 text-sm drop-shadow">Einstellungen</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-white text-sm block mb-1 drop-shadow">Tagesziel (ml)</label>
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/80 text-emerald-900 rounded-lg border border-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                    min="1000"
                    max="5000"
                    step="100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="notifications-enabled"
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={e => setNotificationsEnabled(e.target.checked)}
                    className="accent-emerald-500 h-4 w-4 rounded border-white/60 focus:ring-emerald-400"
                  />
                  <label htmlFor="notifications-enabled" className="text-white text-sm select-none cursor-pointer drop-shadow">
                    Trink-Erinnerungen aktivieren
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm transition-colors drop-shadow"
                  >
                    Fertig
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}