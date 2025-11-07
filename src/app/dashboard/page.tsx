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
  RefreshCw,
  LogIn,
  LogOut,
  Clock
} from 'lucide-react'
import FastingCardStack from '@/components/FastingCardStack'
import ChallengeSection from '@/components/ChallengeSection'
import DashboardOverviewSwiper from '@/components/DashboardOverviewSwiper'
import AppleHealthRings from '@/components/AppleHealthRings'

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
  const { user, profile, setProfile, isCheckedIn, setIsCheckedIn } = useAuthStore()
  const { dailyGoals, setEntries, setDailyGoals } = useDiaryStore()
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<DiaryEntry[]>([])
  const [todayActivities, setTodayActivities] = useState<UserActivity[]>([])
  const [waterIntake, setWaterIntake] = useState(0)
  const [waterGoal, setWaterGoal] = useState(2000) // 2L = 2000ml

  // NEU: Zustand für Check-in WIRD JETZT AUS DEM STORE VERWENDET
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  // Effekt für den Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = now.getTime() - checkInTime.getTime()
        
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0')
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0')
        const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0')
        
        setElapsedTime(`${hours}:${minutes}:${seconds}`)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCheckedIn, checkInTime])

  const handleCheckIn = () => {
    router.push('/scanner?mode=check-in');
  }

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setElapsedTime('00:00:00');
  }

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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Error loading dashboard profile:', profileError)
      }

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
  }, [user, setProfile, setDailyGoals, setEntries])

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
        <div className="min-h-screen bg-black flex-1 flex flex-col overflow-x-hidden pb-24" style={{ scrollBehavior: 'smooth' }}>
          <div className="px-4 pt-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                {getGreeting()}{getFirstName() && `, ${getFirstName()}`}!
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {new Date().toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            {/* Achievement Badges */}
            <div className="flex items-center space-x-2">
              {calorieProgress >= 80 && calorieProgress <= 120 && (
                <div className="flex items-center px-2 py-1 bg-emerald-500 rounded-full shadow-lg">
                  <Award className="h-3 w-3 text-white mr-1" />
                  <span className="text-xs font-medium text-white">Kalorien</span>
                </div>
              )}
              {waterProgress >= 100 && (
                <div className="flex items-center px-2 py-1 bg-blue-500 rounded-full shadow-lg ml-2">
                  <Award className="h-3 w-3 text-white mr-1" />
                  <span className="text-xs font-medium text-white">Wasser</span>
                </div>
              )}
            </div>
          </div>

        <div className="px-4 space-y-6 pt-4 flex-1">
          
          {/* NEUE CHECK-IN KARTE */}
          <div 
            className="relative bg-cover bg-center rounded-3xl shadow-2xl p-6 text-white animate-fade-in overflow-hidden"
            style={{ backgroundImage: "url('/1.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            <div className="relative z-10">
              {!isCheckedIn ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Bereit fürs Training?</h2>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <LogIn className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm mb-6">Scanne den QR-Code am Eingang, um dein Training zu starten.</p>
                  <button 
                    onClick={handleCheckIn}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center transition-transform transform hover:scale-105 shadow-lg"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    JETZT EINCHECKEN
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">Du trainierst!</h2>
                      <div className="flex items-center text-gray-200 mt-1">
                        <Clock className="h-4 w-4 mr-2 text-cyan-400" />
                        <span className="text-lg font-mono">{elapsedTime}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Clock className="h-6 w-6 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm mb-6">Gib alles! Dein Einsatz zählt. 💪</p>
                  <button 
                    onClick={handleCheckOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center transition-transform transform hover:scale-105 shadow-lg"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    TRAINING BEENDEN
                  </button>
              </>
            )}
          </div>
        </div>

        {/* Apple Health Rings */}
        <AppleHealthRings />

        <DashboardOverviewSwiper />
        <FastingCardStack />
        <ChallengeSection />          {/* Insights Card */}
          <div className="bg-gray-900 rounded-3xl shadow-lg border border-gray-800 p-6 pb-2">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-6 w-6 mr-2 text-emerald-400" />
              <h3 className="text-lg font-semibold text-gray-100">Deine Fortschritte</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Behalte deine Ziele im Auge und bleib motiviert. Wir unterstützen dich dabei!
            </p>
            <button 
              onClick={() => router.push('/chat')}
              className="flex items-center text-emerald-400 font-medium"
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
