'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore, useDiaryStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { ProgressBar, LoadingSpinner, Button } from '@/components/ui'
import { calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'

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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning!</h1>
          <p className="text-lg text-gray-600">Here&apos;s your nutrition overview for today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 .5 1.5 2 2.5 4 2.5 2 0 3.5-1 4-2.5 2 2 2.5 5 2.5 7 2-1 2.657-2.657 2.657-2.657A8 8 0 0117.657 18.657z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(todayTotals.calories)}
                </p>
                <p className="text-xs text-gray-500">
                  of {dailyGoals.calories} goal
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Protein</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(todayTotals.protein)}g
                </p>
                <p className="text-xs text-gray-500">
                  of {dailyGoals.protein}g goal
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Carbs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(todayTotals.carbs)}g
                </p>
                <p className="text-xs text-gray-500">
                  of {dailyGoals.carbs}g goal
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fat</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(todayTotals.fat)}g
                </p>
                <p className="text-xs text-gray-500">
                  of {dailyGoals.fat}g goal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Progress</h3>
            <div className="space-y-6">
              <ProgressBar
                label="Calories"
                value={todayTotals.calories}
                max={dailyGoals.calories}
                color="primary"
              />
              <ProgressBar
                label="Protein"
                value={todayTotals.protein}
                max={dailyGoals.protein}
                color="success"
              />
              <ProgressBar
                label="Carbs"
                value={todayTotals.carbs}
                max={dailyGoals.carbs}
                color="warning"
              />
              <ProgressBar
                label="Fat"
                value={todayTotals.fat}
                max={dailyGoals.fat}
                color="danger"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Entries</h3>
            {todayEntries.length > 0 ? (
              <div className="space-y-3">
                {todayEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{entry.food_name}</p>
                      <p className="text-sm text-gray-600">{entry.quantity} {entry.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{entry.calories} cal</p>
                      <p className="text-sm text-gray-600">{entry.meal_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No entries for today yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="primary"
              onClick={() => router.push('/diary')}
              className="w-full"
            >
              Add Food Entry
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/recipes')}
              className="w-full"
            >
              Browse Recipes
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/chat')}
              className="w-full"
            >
              AI Nutrition Chat
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="w-full"
            >
              Update Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
