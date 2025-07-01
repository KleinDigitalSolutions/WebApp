'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore, useDiaryStore } from '@/store'
import { LoadingSpinner, Button } from '@/components/ui'
import { calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'
import { 
  PlusCircle, 
  Zap, 
  Flame, 
  Droplet, 
  Beef, 
  Wheat, 
  Salad, 
  Heart,
  TrendingUp,
  Calendar,
  Activity,
  Award,
  Sparkles
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { user, setProfile } = useAuthStore()
  const { dailyGoals, setEntries, setDailyGoals } = useDiaryStore()
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<DiaryEntry[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadData = async () => {
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
          const macroTargets = calculateMacroTargets(calorieGoal, profileData.goal)
          
          setDailyGoals({
            calories: calorieGoal,
            protein: macroTargets.protein,
            carbs: macroTargets.carbs,
            fat: macroTargets.fat,
          })
        }

        // Load today's diary entries
        const today = new Date().toISOString().split('T')[0]
        const { data: diaryData } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('entry_date', today)
          .order('created_at', { ascending: false })

        if (diaryData) {
          setTodayEntries(diaryData)
          setEntries(diaryData)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, router, setProfile, setEntries, setDailyGoals])

  // Calculate today's totals
  const todayTotals = todayEntries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein_g,
      carbs: totals.carbs + entry.carb_g,
      fat: totals.fat + entry.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Calculate completion percentages
  const calorieProgress = (todayTotals.calories / dailyGoals.calories) * 100
  const proteinProgress = (todayTotals.protein / dailyGoals.protein) * 100
  const carbsProgress = (todayTotals.carbs / dailyGoals.carbs) * 100
  const fatProgress = (todayTotals.fat / dailyGoals.fat) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const userName = user?.user_metadata.full_name || user?.email?.split('@')[0] || 'Nutzer'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Dein persönliches Ernährungs-Dashboard
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Hallo{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                {userName}
              </span>
              ! 👋
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hier ist deine Ernährungsübersicht für heute. Du machst großartige Fortschritte!
            </p>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Calories Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Kalorien</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(todayTotals.calories)}
                  <span className="text-sm text-gray-500">/{Math.round(dailyGoals.calories)}</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round(calorieProgress)}% erreicht</p>
          </div>

          {/* Protein Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Beef className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(todayTotals.protein)}g
                  <span className="text-sm text-gray-500">/{Math.round(dailyGoals.protein)}g</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(proteinProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round(proteinProgress)}% erreicht</p>
          </div>

          {/* Carbs Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Wheat className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Kohlenhydrate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(todayTotals.carbs)}g
                  <span className="text-sm text-gray-500">/{Math.round(dailyGoals.carbs)}g</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(carbsProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round(carbsProgress)}% erreicht</p>
          </div>

          {/* Fat Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Fette</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(todayTotals.fat)}g
                  <span className="text-sm text-gray-500">/{Math.round(dailyGoals.fat)}g</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fatProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round(fatProgress)}% erreicht</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Progress Overview */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Daily Progress Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                    Tagesfortschritt
                  </h2>
                  <p className="text-gray-600 mt-1">Deine Makronährstoff-Ziele im Überblick</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-6">
                {/* Overall Progress */}
                <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-xl">
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {Math.round((calorieProgress + proteinProgress + carbsProgress + fatProgress) / 4)}%
                  </div>
                  <p className="text-gray-600">Gesamtfortschritt heute</p>
                </div>

                {/* Detailed Macros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Beef className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Protein</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {Math.round(todayTotals.protein)}g von {Math.round(dailyGoals.protein)}g
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wheat className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Kohlenhydrate</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(carbsProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {Math.round(todayTotals.carbs)}g von {Math.round(dailyGoals.carbs)}g
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Droplet className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fette</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(fatProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {Math.round(todayTotals.fat)}g von {Math.round(dailyGoals.fat)}g
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badge (if goals met) */}
            {calorieProgress >= 80 && proteinProgress >= 80 && (
              <div className="bg-gradient-to-r from-emerald-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Fantastische Leistung! 🎉</h3>
                    <p className="text-white/90">Du hast heute deine Ernährungsziele erreicht!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Log */}
          <div className="space-y-8">
            
            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Schnellaktionen</h2>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/diary')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Nahrung hinzufügen
                </Button>
                <Button 
                  onClick={() => router.push('/recipes')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Salad className="w-5 h-5 mr-2" />
                  Rezepte entdecken
                </Button>
                <Button 
                  onClick={() => router.push('/chat')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  KI-Assistent
                </Button>
              </div>
            </div>

            {/* Today's Food Log */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Heutige Einträge</h2>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {todayEntries.length} Einträge
                </span>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayEntries.length > 0 ? (
                  todayEntries.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-purple-50 border border-emerald-100">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{entry.food_name}</p>
                        <p className="text-sm text-gray-600">{entry.quantity || 100}g</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{entry.calories} kcal</p>
                        <p className="text-xs text-gray-500">
                          P: {Math.round(entry.protein_g)}g | K: {Math.round(entry.carb_g)}g | F: {Math.round(entry.fat_g)}g
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Noch keine Einträge für heute</p>
                    <Button 
                      onClick={() => router.push('/diary')}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                    >
                      Ersten Eintrag hinzufügen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
