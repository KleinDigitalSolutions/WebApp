'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Profile } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, Input, Select, LoadingSpinner } from '@/components/ui'
import { calculateBMI, getBMICategory, calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Profile>>({
    age: undefined,
    gender: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    activity_level: undefined,
    goal: undefined,
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setFormData(data)
        } else if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{ id: user.id }])
            .select()
            .single()

          if (newProfile) {
            setProfile(newProfile)
            setFormData(newProfile)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, router, setProfile])

  const handleInputChange = (field: keyof Profile, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user!.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setProfile(data)
        // Redirect to dashboard if this is initial setup
        if (!profile?.age) {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const bmi = formData.weight_kg && formData.height_cm 
    ? calculateBMI(formData.weight_kg, formData.height_cm)
    : 0

  const estimatedCalories = formData.age && formData.weight_kg && formData.height_cm && formData.gender && formData.activity_level && formData.goal
    ? calculateDailyCalorieGoal(formData as Profile)
    : 0

  const macroTargets = estimatedCalories > 0 
    ? calculateMacroTargets(estimatedCalories, formData.goal)
    : { protein: 0, carbs: 0, fat: 0 }

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
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600">
            Help us personalize your nutrition journey by sharing some basic information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                placeholder="Enter your age"
                min="13"
                max="120"
              />

              <Select
                label="Gender"
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value as Profile['gender'])}
                options={[
                  { value: '', label: 'Select gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Input
                label="Height (cm)"
                type="number"
                value={formData.height_cm || ''}
                onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value) || undefined)}
                placeholder="Enter your height"
                min="100"
                max="250"
              />

              <Input
                label="Weight (kg)"
                type="number"
                value={formData.weight_kg || ''}
                onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || undefined)}
                placeholder="Enter your weight"
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            {bmi > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>BMI:</strong> {bmi} ({getBMICategory(bmi)})
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activity & Goals</h2>
            
            <div className="space-y-6">
              <Select
                label="Activity Level"
                value={formData.activity_level || ''}
                onChange={(e) => handleInputChange('activity_level', e.target.value as Profile['activity_level'])}
                options={[
                  { value: '', label: 'Select activity level' },
                  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
                  { value: 'lightly_active', label: 'Lightly active (light exercise 1-3 days/week)' },
                  { value: 'moderately_active', label: 'Moderately active (moderate exercise 3-5 days/week)' },
                  { value: 'very_active', label: 'Very active (hard exercise 6-7 days/week)' },
                  { value: 'extra_active', label: 'Extra active (very hard exercise, physical job)' },
                ]}
              />

              <Select
                label="Primary Goal"
                value={formData.goal || ''}
                onChange={(e) => handleInputChange('goal', e.target.value as Profile['goal'])}
                options={[
                  { value: '', label: 'Select your goal' },
                  { value: 'lose_weight', label: 'Lose weight' },
                  { value: 'maintain_weight', label: 'Maintain current weight' },
                  { value: 'gain_weight', label: 'Gain weight' },
                  { value: 'build_muscle', label: 'Build muscle' },
                ]}
              />
            </div>
          </div>

          {estimatedCalories > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Estimated Daily Targets</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{estimatedCalories}</div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{macroTargets.protein}g</div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{macroTargets.carbs}g</div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{macroTargets.fat}g</div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                <strong>Note:</strong> These are estimates based on the Mifflin-St Jeor equation. 
                Individual needs may vary. Consult with a healthcare professional for personalized advice.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={!formData.age || !formData.gender || !formData.height_cm || !formData.weight_kg || !formData.activity_level || !formData.goal}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
