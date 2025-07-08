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
  Dumbbell
} from 'lucide-react'

// Meal types with recommended calories
const mealTypes = [
  {
    key: 'breakfast',
    label: 'Frühstück',
    recommendedCalories: 673,
    image: '/api/placeholder/80/80', // Placeholder für Frühstück
    gradient: 'from-orange-400 to-red-400'
  },
  {
    key: 'lunch',
    label: 'Mittagessen',
    recommendedCalories: 853,
    image: '/api/placeholder/80/80', // Placeholder für Mittagessen
    gradient: 'from-green-400 to-emerald-400'
  },
  {
    key: 'dinner',
    label: 'Abendessen',
    recommendedCalories: 628,
    image: '/api/placeholder/80/80', // Placeholder für Abendessen
    gradient: 'from-blue-400 to-purple-400'
  },
  {
    key: 'snack',
    label: 'Snack',
    recommendedCalories: 89,
    image: '/api/placeholder/80/80', // Placeholder für Snack
    gradient: 'from-pink-400 to-rose-400'
  }
]

export default function DiaryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-slate-50">
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
            {mealTypes.map((mealType) => {
              const mealEntries = groupedEntries[mealType.key] || []
              const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0)

              return (
                <div key={mealType.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    {/* Meal Info with Image */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                          {/* Food SVG Placeholder */}
                          <div className={`w-full h-full bg-gradient-to-br ${mealType.gradient} flex items-center justify-center`}>
                            <svg 
                              width="32" 
                              height="32" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="2"
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              {mealType.key === 'breakfast' && (
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              )}
                              {mealType.key === 'lunch' && (
                                <path d="M18 15l-6-6-6 6M12 3v18" />
                              )}
                              {mealType.key === 'dinner' && (
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              )}
                              {mealType.key === 'snack' && (
                                <circle cx="12" cy="12" r="10" />
                              )}
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{mealType.label}</h3>
                        <p className="text-sm text-gray-600">
                          empfohlen {mealType.recommendedCalories} kcal
                        </p>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button 
                      onClick={() => router.push(`/diary/add?meal=${mealType.key}`)}
                      className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Show added entries if any */}
                  {mealEntries.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600 mb-2">
                        Hinzugefügt: {mealCalories} kcal
                      </div>
                      <div className="space-y-2">
                        {mealEntries.slice(0, 3).map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{entry.food_name}</span>
                            <span className="text-gray-500">{entry.calories} kcal</span>
                          </div>
                        ))}
                        {mealEntries.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{mealEntries.length - 3} weitere Einträge
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Training Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Dumbbell className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Training</h3>
                    <p className="text-sm text-gray-600">
                      Aktiviere den Schrittzähler
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Erhalte ein genaueres Kalorienbudget.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/activities')}
                  className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
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
  const [loading, setLoading] = useState(true)
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
      setLoading(true)
      const response = await fetch(`/api/water?userId=${user.id}&date=${dateKey}`)
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
      setLoading(false)
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
      
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          date: dateKey,
          amount_ml: amount,
          daily_goal_ml: dailyGoal,
          user_weight: userWeight,
          activity_level: activityLevel,
          achievements: newAchievements
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-200"></div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xl">💧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Wasser</h3>
                    <p className="text-sm text-gray-600">{waterIntake}ml / {dailyGoal}ml</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={resetWater}
                    disabled={saving}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
                  <span className="text-sm text-gray-500">{dailyGoal - waterIntake}ml verbleibend</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[250, 500, 750, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => addWater(amount)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors active:scale-95 text-blue-700 border border-blue-100"
                  >
                    <span className="text-lg block mb-1">💧</span>
                    <div className="text-xs font-medium text-blue-700">{amount}ml</div>
                  </button>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={removeWater}
                  disabled={waterIntake === 0 || saving}
                  className="flex-1 p-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 rounded-lg font-medium transition-colors active:scale-95 text-sm"
                >
                  - {glassSize}ml
                </button>
                <button
                  onClick={() => addWater(glassSize)}
                  disabled={saving}
                  className="flex-1 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors active:scale-95 text-sm"
                >
                  + {glassSize}ml
                </button>
              </div>

              {/* Achievement */}
              {waterIntake >= dailyGoal && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🎉</span>
                    <p className="text-sm font-medium text-green-800">Tagesziel erreicht!</p>
                  </div>
                </div>
              )}
              
              {/* Settings Panel */}
              {showSettings && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-gray-900 font-medium mb-3 text-sm">Einstellungen</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-700 text-sm block mb-1">Tagesziel (ml)</label>
                      <input
                        type="number"
                        value={dailyGoal}
                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="accent-blue-500 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="notifications-enabled" className="text-gray-700 text-sm select-none cursor-pointer">
                        Trink-Erinnerungen aktivieren
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Fertig
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}