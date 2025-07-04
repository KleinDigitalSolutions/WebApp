'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Edit,
  Plus // <-- Hinzugefügt
} from 'lucide-react'

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
  }, [user, selectedDate, router, loadEntries])

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const deleteEntry = async (entryId: string) => {
    try {
      await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)
      
      setEntries(entries.filter(entry => entry.id !== entryId))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const groupedEntries = entries.reduce((groups, entry) => {
    const mealType = entry.meal_type
    if (!groups[mealType]) {
      groups[mealType] = []
    }
    groups[mealType].push(entry)
    return groups
  }, {} as Record<string, DiaryEntry[]>)

  const mealTypes = [
    { key: 'breakfast', label: 'Frühstück', icon: '☕' },
    { key: 'lunch', label: 'Mittagessen', icon: '🍽️' },
    { key: 'dinner', label: 'Abendessen', icon: '🥗' },
    { key: 'snack', label: 'Snacks', icon: '🍎' }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Hintergrund-Welle (SVG, wie bei Challenge-Karten) */}
      <div className="absolute inset-x-0 top-0 z-0 pointer-events-none select-none" aria-hidden="true">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-32 md:h-40 lg:h-56">
          <path fill="url(#wave-gradient)" fillOpacity="1" d="M0,160L60,154.7C120,149,240,139,360,154.7C480,171,600,213,720,218.7C840,224,960,192,1080,181.3C1200,171,1320,181,1380,186.7L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#f0fdf4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative z-10">
        {/* Tagesübersicht und Navigation jetzt im Seitenfluss, nicht sticky */}
        <div className="px-4 pt-6 pb-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Ernährungstagebuch</h1>
          </div>
          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => changeDate('prev')}
              className="p-2 rounded-full transition-colors active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">
                {selectedDate.toLocaleDateString('de-DE', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>
            <button 
              onClick={() => changeDate('next')}
              className="p-2 rounded-full transition-colors active:scale-95"
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

        {/* Water Tracker - Prominent above meals */}
        <WaterTracker selectedDate={selectedDate} />

        <div className="px-4 py-6 space-y-6">
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
                  <div key={mealType.key} className="bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                    {/* Design-Effekt: Sanfte Mint-Welle unter der Karte */}
                    <div className="absolute left-0 bottom-0 w-full h-16 z-0 pointer-events-none select-none">
                      <svg viewBox="0 0 400 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M0 32 Q100 64 200 32 T400 32 V64 H0Z" fill="url(#mint-wave)" fillOpacity="0.22" />
                        <defs>
                          <linearGradient id="mint-wave" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6ee7b7" />
                            <stop offset="100%" stopColor="#a7f3d0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="relative z-10">
                      {/* Compact Meal Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">{mealType.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{mealType.label}</h3>
                            <p className="text-sm text-gray-600">{mealCalories} kcal</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => router.push(`/diary/add?meal=${mealType.key}`)}
                          className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Meal Entries - Only show if there are entries */}
                      {mealEntries.length === 0 ? (
                        <div className="px-4 pb-4">
                          <div className="text-center py-6 border-t border-gray-100">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Plus className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm mb-2">Keine Einträge für {mealType.label.toLowerCase()}</p>
                            <button 
                              onClick={() => router.push(`/diary/add?meal=${mealType.key}`)}
                              className="text-emerald-600 font-medium text-sm"
                            >
                              Erstes Lebensmittel hinzufügen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-gray-100">
                          <div className="px-4 py-3 space-y-2">
                            {mealEntries.map((entry) => (
                              <div 
                                key={entry.id} 
                                className="group flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{entry.food_name}</h4>
                                  <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                                    <span>{entry.quantity}{entry.unit}</span>
                                    <span className="font-medium text-emerald-600">{entry.calories} kcal</span>
                                    <span className="text-gray-400">
                                      {new Date(entry.created_at).toLocaleTimeString('de-DE', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => router.push(`/diary/edit/${entry.id}`)}
                                    className="p-1.5 bg-blue-500 text-white rounded-lg transition-colors active:scale-95"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={() => deleteEntry(entry.id)}
                                    className="p-1.5 bg-red-500 text-white rounded-lg transition-colors active:scale-95"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
      {/* Motivations-/Tages-Tipp Bereich unter den Mahlzeitenkarten */}
      <div className="mt-8 mb-8 flex justify-center">
        <div className="backdrop-blur-xl bg-white/70 border border-emerald-100 rounded-2xl shadow-lg px-6 py-4 flex items-center space-x-3 max-w-md w-full">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">Tages-Tipp</p>
            <p className="text-gray-700 text-sm">Trinke heute zu jeder Mahlzeit ein Glas Wasser – dein Körper wird es dir danken! 💧</p>
          </div>
        </div>
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

  const dateKey = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD format

  // Load water intake for the selected date from Supabase
  const loadWaterIntake = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch(`/api/water?userId=${user.id}&date=${dateKey}`)
      const data = await response.json()
      
      if (response.ok) {
        setWaterIntake(data.amount_ml || 0)
        setDailyGoal(data.daily_goal_ml || 2000)
      }
    } catch (error) {
      console.error('Error loading water intake:', error)
    } finally {
      setLoading(false)
    }
  }, [user, dateKey])

  // Save water intake to Supabase
  const saveWaterIntake = useCallback(async (amount: number) => {
    if (!user || saving) return

    try {
      setSaving(true)
      const response = await fetch('/api/water', {
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
    } catch (error) {
      console.error('Error saving water intake:', error)
    } finally {
      setSaving(false)
    }
  }, [user, dateKey, dailyGoal, saving])

  // Load data when component mounts or date changes
  useEffect(() => {
    loadWaterIntake()
  }, [loadWaterIntake])

  const percentage = Math.min((waterIntake / dailyGoal) * 100, 100)
  
  const addWater = async (amount: number) => {
    const newAmount = Math.min(waterIntake + amount, dailyGoal + 1000)
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
    <div className="mx-4 mt-4 mb-6">
      <div className="relative rounded-3xl shadow-2xl p-6 border-0 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)'}}>
        {/* Hochglanz-Overlay */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none z-0">
          <div className="absolute left-0 top-0 w-full h-1/2 rounded-t-3xl bg-white/30 blur-[2px] opacity-60" />
          <div className="absolute right-0 bottom-0 w-2/3 h-1/3 rounded-br-3xl bg-white/10 blur-[2px] opacity-40" />
          <div className="absolute left-0 top-0 w-full h-full rounded-3xl border border-white/30" />
        </div>
        <div className="relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-200"></div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white">💧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Wasser</h3>
                    <p className="text-sm text-blue-100">{waterIntake}ml von {dailyGoal}ml</p>
                    {selectedDate.toDateString() !== new Date().toDateString() && (
                      <p className="text-xs text-blue-200">
                        {selectedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={resetWater}
                  disabled={saving}
                  className="text-blue-200 hover:text-white transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

          {/* Water Progress Visualization */}
          <div className="mb-6">
            {/* Water Bottle Visualization */}
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-32 bg-blue-50 rounded-full border-4 border-blue-200 overflow-hidden">
                {/* Water level */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-700 ease-out"
                  style={{ height: `${percentage}%` }}
                >
                  {/* Water animation bubbles */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-bounce"></div>
                    <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                    <div className="absolute top-6 left-3 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </div>
                {/* Bottle cap */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-300 rounded-t-lg"></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-3">
              <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-blue-100 mt-1">
                <span>0ml</span>
                <span className="font-medium text-white">{Math.round(percentage)}%</span>
                <span>{dailyGoal}ml</span>
              </div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => addWater(100)}
              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors active:scale-95 text-blue-700"
            >
              <span className="text-2xl block mb-1">🥛</span>
              <div className="text-xs font-medium">100ml</div>
            </button>
            <button
              onClick={() => addWater(250)}
              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors active:scale-95 text-blue-700"
            >
              <span className="text-2xl block mb-1">🥛</span>
              <div className="text-xs font-medium">250ml</div>
            </button>
            <button
              onClick={() => addWater(500)}
              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors active:scale-95 text-blue-700"
            >
              <span className="text-2xl block mb-1">🥛</span>
              <div className="text-xs font-medium">500ml</div>
            </button>
            <button
              onClick={() => addWater(750)}
              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors active:scale-95 text-blue-700"
            >
              <span className="text-2xl block mb-1">🥛</span>
              <div className="text-xs font-medium">750ml</div>
            </button>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={removeWater}
              disabled={waterIntake === 0 || saving}
              className="flex-1 p-3 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 rounded-xl font-medium transition-colors active:scale-95"
            >
              - {glassSize}ml
            </button>
            <button
              onClick={() => addWater(glassSize)}
              disabled={saving}
              className="flex-1 p-3 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors active:scale-95"
            >
              + {glassSize}ml
            </button>
          </div>

          {/* Achievement */}
          {waterIntake >= dailyGoal && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎉</span>
                <div>
                  <p className="text-sm font-medium text-green-800">Tagesziel erreicht!</p>
                  <p className="text-xs text-green-600">Du hast dein Wasserziel geschafft</p>
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
