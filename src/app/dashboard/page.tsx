'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore, useDiaryStore } from '@/store'
import { ProgressBar, LoadingSpinner, Button } from '@/components/ui'
import { calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'
import { PlusCircle, Zap, Flame, Droplet, Beef, Wheat, Salad } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Good morning, {user?.user_metadata.full_name || 'User'}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Here&apos;s your nutrition overview for today.</p>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Calorie & Macro Summary */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Calorie Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calories</h2>
                <div className="flex items-center text-lg font-semibold text-green-500">
                  <Flame className="w-6 h-6 mr-2" />
                  <span>{Math.round(todayTotals.calories)} / {Math.round(dailyGoals.calories)} kcal</span>
                </div>
              </div>
              <ProgressBar value={todayTotals.calories} max={dailyGoals.calories} color="success" />
            </div>

            {/* Macros Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Macronutrients</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Protein */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-lg font-semibold text-blue-500 mb-2">
                    <Beef className="w-6 h-6 mr-2" />
                    <span>Protein</span>
                  </div>
                  <ProgressBar value={todayTotals.protein} max={dailyGoals.protein} color="primary" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(todayTotals.protein)}g / {Math.round(dailyGoals.protein)}g
                  </p>
                </div>
                {/* Carbs */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-lg font-semibold text-yellow-500 mb-2">
                    <Wheat className="w-6 h-6 mr-2" />
                    <span>Carbs</span>
                  </div>
                  <ProgressBar value={todayTotals.carbs} max={dailyGoals.carbs} color="warning" />
                   <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(todayTotals.carbs)}g / {Math.round(dailyGoals.carbs)}g
                  </p>
                </div>
                {/* Fat */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-lg font-semibold text-red-500 mb-2">
                    <Droplet className="w-6 h-6 mr-2" />
                    <span>Fat</span>
                  </div>
                  <ProgressBar value={todayTotals.fat} max={dailyGoals.fat} color="danger" />
                   <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(todayTotals.fat)}g / {Math.round(dailyGoals.fat)}g
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Today's Log */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/diary')}
                  className="w-full flex items-center justify-center text-lg bg-green-500 hover:bg-green-600 text-white"
                >
                  <PlusCircle className="w-6 h-6 mr-2" />
                  Add Food to Diary
                </Button>
                 <Button 
                  onClick={() => router.push('/recipes')}
                  className="w-full flex items-center justify-center text-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Salad className="w-6 h-6 mr-2" />
                  Browse Recipes
                </Button>
                 <Button 
                  onClick={() => router.push('/chat')}
                  className="w-full flex items-center justify-center text-lg bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Zap className="w-6 h-6 mr-2" />
                  Chat with AI Assistant
                </Button>
              </div>
            </div>

            {/* Today's Log Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Today&apos;s Log</h2>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {todayEntries.length > 0 ? (
                  todayEntries.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <span className="font-medium capitalize">{entry.food_name}</span>
                      <span className="font-semibold text-green-500">{entry.calories} kcal</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No entries for today.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
