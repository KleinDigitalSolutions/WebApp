'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry, UserActivity } from '@/lib/supabase'
import { useAuthStore, useDiaryStore } from '@/store'
import { calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'
import { 
  PlusCircle, 
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import FastingCardStack from '@/components/FastingCardStack'
import ChallengeSection from '@/components/ChallengeSection'
import DashboardOverviewSwiper from '@/components/DashboardOverviewSwiper'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
}

function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center bg-gray-50 z-10"
          style={{ 
            height: pullDistance || (isRefreshing ? 60 : 0),
            transition: isRefreshing ? 'height 0.3s ease' : 'none'
          }}
        >
          <RefreshCw 
            className={`h-6 w-6 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: `rotate(${pullDistance * 3.6}deg)`,
              transition: isRefreshing ? 'transform 0.3s ease' : 'none'
            }}
          />
        </div>
      )}
      
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { user, profile, setProfile } = useAuthStore()
  const { dailyGoals, setEntries, setDailyGoals } = useDiaryStore()
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<DiaryEntry[]>([])
  const [todayActivities, setTodayActivities] = useState<UserActivity[]>([])
  const [waterIntake, setWaterIntake] = useState(0)
  const [waterGoal, setWaterGoal] = useState(2000) // 2L = 2000ml

  // Funktion für zeitbasierte Begrüßung
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "Gute Nacht"
    if (hour < 12) return "Guten Morgen"
    if (hour < 17) return "Guten Tag"
    if (hour < 21) return "Guten Abend"
    return "Gute Nacht"
  }

  // Funktion um Vorname zu bestimmen (Profil oder E-Mail)
  const getFirstName = () => {
    // 1. Priorität: Vorname aus Profil
    if (profile?.first_name) {
      return profile.first_name
    }
    
    // 2. Fallback: Vorname aus E-Mail extrahieren
    if (!user?.email) return ""
    
    // Versuche verschiedene Extraktionsmethoden
    const email = user.email.toLowerCase()
    
    // 1. Wenn Punkt im Namen: "max.mustermann@email.com" → "Max"
    if (email.includes('.') && !email.startsWith('.')) {
      const beforeAt = email.split('@')[0]
      const firstName = beforeAt.split('.')[0]
      return firstName.charAt(0).toUpperCase() + firstName.slice(1)
    }
    
    // 2. Wenn Unterstrich: "max_mustermann@email.com" → "Max"
    if (email.includes('_')) {
      const beforeAt = email.split('@')[0]
      const firstName = beforeAt.split('_')[0]
      return firstName.charAt(0).toUpperCase() + firstName.slice(1)
    }
    
    // 3. Wenn Zahlen am Ende: "max123@email.com" → "Max"
    const beforeAt = email.split('@')[0]
    const nameWithoutNumbers = beforeAt.replace(/\d+$/, '')
    if (nameWithoutNumbers.length >= 2 && nameWithoutNumbers.length <= 15) {
      return nameWithoutNumbers.charAt(0).toUpperCase() + nameWithoutNumbers.slice(1)
    }
    
    // 4. Fallback: Ersten Teil der E-Mail nehmen, wenn sinnvoll
    if (beforeAt.length >= 2 && beforeAt.length <= 20) {
      return beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1)
    }
    
    return ""
  }

  const loadData = useCallback(async () => {
    if (!user) return

    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        
        // Calculate daily goals based on profile
        const calorieGoal = calculateDailyCalorieGoal(profileData)
        
        const macroTargets = calculateMacroTargets(calorieGoal)
        setDailyGoals({
          calories: calorieGoal,
          protein: macroTargets.protein,
          carbs: macroTargets.carbs,
          fat: macroTargets.fat
        })
      }

      // Load today's entries
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

      // Load today's activities
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .order('created_at', { ascending: false })

      if (activities) setTodayActivities(activities)

      // Load water intake for today
      try {
        const response = await fetch(`/api/water?userId=${user.id}&date=${today}`)
        const data = await response.json()
        
        if (response.ok) {
          setWaterIntake(data.amount_ml || 0)
          setWaterGoal(data.daily_goal_ml || 2000)
        }
      } catch (error) {
        console.error('Error loading water intake:', error)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, setProfile, setDailyGoals, setEntries, setTodayEntries, setTodayActivities, setWaterIntake, setWaterGoal, setLoading])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, router, loadData])

  // Calculate consumed nutrients
  const consumedCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const consumedProtein = todayEntries.reduce((sum, entry) => sum + entry.protein_g, 0)
  const consumedCarbs = todayEntries.reduce((sum, entry) => sum + entry.carb_g, 0)
  const consumedFat = todayEntries.reduce((sum, entry) => sum + entry.fat_g, 0)
  const consumedFiber = todayEntries.reduce((sum, entry) => sum + (entry.fiber_g || 0), 0)
  const consumedSugar = todayEntries.reduce((sum, entry) => sum + (entry.sugar_g || 0), 0)
  const consumedSodium = todayEntries.reduce((sum, entry) => sum + (entry.sodium_mg || 0), 0)

  // Calculate percentages
  const calorieProgress = dailyGoals.calories ? (consumedCalories / dailyGoals.calories) * 100 : 0
  const waterProgress = waterGoal ? (waterIntake / waterGoal) * 100 : 0

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <PullToRefresh onRefresh={loadData}>
        <div className="min-h-screen bg-[#ffffff] flex-1 flex flex-col min-h-0 overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
          <div className="px-4 pt-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getGreeting()}{getFirstName() && `, ${getFirstName()}`}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
              {/* Personalisierte Zielkarte nach Onboarding */}
              {profile?.onboarding_completed && profile?.weight_kg && profile?.target_weight_kg && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-start animate-fade-in">
                  <div className="flex items-center mb-1">
                    <Award className="h-5 w-5 text-emerald-500 mr-2" />
                    <span className="font-semibold text-emerald-700">Dein Ziel:</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-900">
                    {profile.weight_kg > profile.target_weight_kg
                      ? `- ${(profile.weight_kg - profile.target_weight_kg).toFixed(1)} kg bis ${(() => {
                          // Ziel-Datum grob schätzen (0.5kg/Woche)
                          const weeks = Math.max(1, Math.ceil((profile.weight_kg - profile.target_weight_kg) / 0.5))
                          const targetDate = new Date()
                          targetDate.setDate(targetDate.getDate() + weeks * 7)
                          return targetDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
                        })()}`
                      : profile.weight_kg < profile.target_weight_kg
                        ? `+ ${(profile.target_weight_kg - profile.weight_kg).toFixed(1)} kg bis ${(() => {
                            const weeks = Math.max(1, Math.ceil((profile.target_weight_kg - profile.weight_kg) / 0.5))
                            const targetDate = new Date()
                            targetDate.setDate(targetDate.getDate() + weeks * 7)
                            return targetDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
                          })()}`
                        : 'Gewicht halten!'}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">Bleib dran – du schaffst das! 💪</div>
                </div>
              )}
            </div>
            {/* Achievement Badges */}
            <div className="flex items-center space-x-2">
              {calorieProgress >= 80 && calorieProgress <= 120 && (
                <div className="flex items-center px-2 py-1 bg-emerald-500 rounded-full shadow-lg">
                  <Award className="h-3 w-3 text-white mr-1" />
                  <span className="text-xs font-medium text-white">Kalorien</span>
                </div>
              )}
              {/* Weitere Badges (z.B. Wasser, Protein) */}
              {waterProgress >= 100 && (
                <div className="flex items-center px-2 py-1 bg-blue-500 rounded-full shadow-lg ml-2">
                  <Award className="h-3 w-3 text-white mr-1" />
                  <span className="text-xs font-medium text-white">Wasser</span>
                </div>
              )}
            </div>
          </div>

        <div className="px-4 space-y-6 pb-20 pt-4 flex-1">
          {/* Neue swipebare/touchbare Dashboard-Übersichtskarte */}
          <DashboardOverviewSwiper />

          {/* Quick Stats Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tagesübersicht</h2>
              <div className="flex items-center text-sm text-gray-700 font-medium">
                <Calendar className="h-4 w-4 mr-1 text-gray-700" />
                Heute
              </div>
            </div>
            
            {/* Main Progress Rings */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              {/* Calorie Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#calorieGradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(calorieProgress, 100) / 100)}`}
                      className="transition-all duration-500 ease-out"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{Math.round(consumedCalories)}</span>
                    <span className="text-xs font-semibold text-gray-600">kcal</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-gray-600">von {dailyGoals.calories}</div>
                </div>
              </div>

              {/* Water Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#waterGradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(waterProgress, 100) / 100)}`}
                      className="transition-all duration-500 ease-out"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{Math.round(waterIntake / 100) / 10}L</span>
                    <span className="text-xs font-semibold text-gray-600">Wasser</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-gray-600">von {waterGoal / 1000}L</div>
                </div>
              </div>
            </div>

            {/* Macro Distribution */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Protein', value: Math.round(consumedProtein) + 'g', color: '#2563eb' }, // kräftiges Blau
                { label: 'Kohlenhydrate', value: Math.round(consumedCarbs) + 'g', color: '#f59e42' },
                { label: 'Fett', value: Math.round(consumedFat) + 'g', color: '#f472b6' },
                { label: 'Ballaststoffe', value: Math.round(consumedFiber) + 'g', color: '#059669' }, // kräftiges Dunkelgrün
                { label: 'Zucker', value: Math.round(consumedSugar) + 'g', color: '#a78bfa' },
                { label: 'Natrium', value: Math.round(consumedSodium) + 'mg', color: '#facc15' },
              ].map((macro) => (
                <div key={macro.label} className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/0 shadow-none">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',margin:'auto'}}>
                        <circle cx="14" cy="14" r="11" stroke={macro.color} strokeWidth="2.5" fill="none" />
                        <circle cx="14" cy="14" r="5.5" fill={macro.color} />
                      </svg>
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{macro.value}</div>
                  <div className="text-xs text-gray-600">{macro.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Aktivitäten des Tages */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Heutige Aktivitäten</h3>
            </div>
            {todayActivities.length === 0 ? (
              <div className="text-center py-6 text-gray-600 text-sm">Noch keine Aktivitäten eingetragen</div>
            ) : (
              <div className="space-y-3">
                {todayActivities.slice(0, 3).map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{act.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-800">{act.activity_name}</div>
                        <div className="text-xs text-gray-600">{act.duration_min} min • {act.calories} kcal</div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {act.note && <div className="italic">{act.note}</div>}
                      <div>{new Date(act.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Meals */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Heutige Mahlzeiten</h3>
              <button 
                onClick={() => router.push('/diary')}
                className="flex items-center text-blue-600 font-medium text-sm"
              >
                Alle anzeigen
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            {todayEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PlusCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">Noch keine Mahlzeiten eingetragen</p>
                <button 
                  onClick={() => router.push('/diary/add')}
                  className="mt-3 text-blue-600 font-medium text-sm"
                >
                  Erste Mahlzeit hinzufügen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{entry.food_name}</h4>
                      <p className="text-sm text-gray-600">{entry.calories} kcal</p>
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

          {/* Fasting Card Stack */}
          <FastingCardStack />

          {/* Challenge Section */}
          <ChallengeSection />

          {/* Insights Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 pb-2">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Deine Fortschritte</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {calorieProgress >= 80 && calorieProgress <= 120 && waterProgress >= 80
                ? "Fantastisch! Du bist perfekt auf Kurs mit deinen Kalorien- und Wasserzielen."
                : calorieProgress >= 80 && calorieProgress <= 120
                  ? "Tolle Kalorienbalance! Vergiss nicht genug zu trinken."
                  : waterProgress >= 80
                    ? "Super Wasserzufuhr! Achte auch auf deine Kalorienziele."
                    : calorieProgress < 80 
                      ? "Du könntest noch etwas mehr essen und trinken, um deine Ziele zu erreichen."
                      : "Du hast deine Kalorienziele bereits überschritten. Achte auf die Balance."
              }
            </p>
            <button 
              onClick={() => router.push('/chat')}
              className="flex items-center text-gray-800 font-medium"
            >
              Mehr Tipps erhalten
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
        </div>
      </PullToRefresh>
    </>
  )
}
