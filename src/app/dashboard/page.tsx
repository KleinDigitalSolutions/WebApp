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
  Sparkles,
  Target,
  Activity
} from 'lucide-react'
import FastingCardStack from '@/components/FastingCardStack'
import ChallengeSection from '@/components/ChallengeSection'
import DashboardOverviewSwiper from '@/components/DashboardOverviewSwiper'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, ModernProgressBar, ModernButton, ModernBadge } from '@/components/ui/ModernComponents'

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
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div 
            className="absolute top-0 left-0 right-0 flex justify-center items-center bg-white/80 backdrop-blur-xl border-b border-white/20 z-10"
            style={{ 
              height: pullDistance || (isRefreshing ? 60 : 0),
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1,
              height: isRefreshing ? 60 : pullDistance
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ 
                rotate: isRefreshing ? 360 : pullDistance * 3.6,
              }}
              transition={{ 
                rotate: { 
                  duration: isRefreshing ? 1 : 0,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: "linear"
                }
              }}
            >
              <RefreshCw className="h-6 w-6 text-primary-600" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        style={{ transform: `translateY(${pullDistance}px)` }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
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
        if (data.waterIntake) {
          setWaterIntake(data.waterIntake)
        }
      } catch (error) {
        console.error('Error loading water intake:', error)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, setProfile, setEntries, setDailyGoals])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    await loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/25">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-secondary-600 font-medium">Lade deine Daten...</p>
        </motion.div>
      </div>
    )
  }

  const totalCalories = todayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0)
  const totalProtein = todayEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0)
  const totalCarbs = todayEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0)
  const totalFat = todayEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0)

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Header */}
        <motion.header 
          className="px-6 py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-2xl font-bold text-secondary-900"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {getGreeting()}, {getFirstName()}! 👋
              </motion.h1>
              <motion.p 
                className="text-secondary-600 mt-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {new Date().toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.p>
            </div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <ModernButton
                onClick={() => router.push('/diary')}
                size="sm"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Hinzufügen
              </ModernButton>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="px-6 pb-24">
          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 gap-4 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <GlassCard className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-1">
                {Math.round(totalCalories)}
              </h3>
              <p className="text-sm text-secondary-600">Kalorien</p>
              <ModernProgressBar 
                value={totalCalories} 
                max={dailyGoals.calories} 
                className="mt-3"
                showPercentage={false}
              />
            </GlassCard>

            <GlassCard className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-success to-green-500 rounded-2xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-1">
                {Math.round(totalProtein)}g
              </h3>
              <p className="text-sm text-secondary-600">Protein</p>
              <ModernProgressBar 
                value={totalProtein} 
                max={dailyGoals.protein} 
                color="success"
                className="mt-3"
                showPercentage={false}
              />
            </GlassCard>
          </motion.div>

          {/* Water Intake */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-info to-blue-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3 3 0 01-6 0c0-.35.06-.687.17-1.003L7.5 6.5V3a1 1 0 011-1z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">Wasseraufnahme</h3>
                    <p className="text-sm text-secondary-600">Heute getrunken</p>
                  </div>
                </div>
                <ModernBadge variant="info" size="sm">
                  {Math.round((waterIntake / waterGoal) * 100)}%
                </ModernBadge>
              </div>
              <ModernProgressBar 
                value={waterIntake} 
                max={waterGoal} 
                color="info"
                label={`${waterIntake}ml / ${waterGoal}ml`}
              />
            </GlassCard>
          </motion.div>

          {/* Dashboard Overview Swiper */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <DashboardOverviewSwiper />
          </motion.div>

          {/* Fasting Card Stack */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <FastingCardStack />
          </motion.div>

          {/* Challenge Section */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <ChallengeSection />
          </motion.div>

          {/* Recent Activities */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Aktuelle Aktivitäten</h3>
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/activities')}
                >
                  Alle anzeigen
                  <ChevronRight className="w-4 h-4 ml-1" />
                </ModernButton>
              </div>
              
              {todayActivities.length > 0 ? (
                <div className="space-y-3">
                  {todayActivities.slice(0, 3).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.7 + index * 0.1, duration: 0.5 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-900">{activity.activity_name}</p>
                        <p className="text-xs text-secondary-600">{activity.duration} Minuten</p>
                      </div>
                      <ModernBadge variant="primary" size="sm">
                        {activity.calories_burned} kcal
                      </ModernBadge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-secondary-400" />
                  </div>
                  <p className="text-secondary-600">Noch keine Aktivitäten heute</p>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push('/activities')}
                  >
                    Aktivität hinzufügen
                  </ModernButton>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PullToRefresh>
  )
}
