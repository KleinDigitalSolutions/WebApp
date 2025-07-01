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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dein Profil</h1>
          <p className="text-gray-600 text-sm">
            Hilf uns, deine Ernährungsreise zu personalisieren
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Grunddaten</h2>
            
            <div className="space-y-4">
              <Input
                label="Alter"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                placeholder="Dein Alter eingeben"
                min="13"
                max="120"
              />

              <Select
                label="Geschlecht"
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value as Profile['gender'])}
                options={[
                  { value: '', label: 'Geschlecht wählen' },
                  { value: 'male', label: 'Männlich' },
                  { value: 'female', label: 'Weiblich' },
                  { value: 'other', label: 'Andere' },
                ]}
              />

              <Input
                label="Größe (cm)"
                type="number"
                value={formData.height_cm || ''}
                onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value) || undefined)}
                placeholder="Deine Größe eingeben"
                min="100"
                max="250"
              />

              <Input
                label="Gewicht (kg)"
                type="number"
                value={formData.weight_kg || ''}
                onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || undefined)}
                placeholder="Dein Gewicht eingeben"
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            {bmi > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm text-green-800">
                  <strong>BMI:</strong> {bmi} ({getBMICategory(bmi)})
                </p>
              </div>
            )}
          </div>

          <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Aktivität & Ziele</h2>
            
            <div className="space-y-4">
              <Select
                label="Aktivitätslevel"
                value={formData.activity_level || ''}
                onChange={(e) => handleInputChange('activity_level', e.target.value as Profile['activity_level'])}
                options={[
                  { value: '', label: 'Aktivitätslevel wählen' },
                  { value: 'sedentary', label: 'Wenig aktiv (kaum Sport)' },
                  { value: 'lightly_active', label: 'Leicht aktiv (1-3 Tage/Woche)' },
                  { value: 'moderately_active', label: 'Mäßig aktiv (3-5 Tage/Woche)' },
                  { value: 'very_active', label: 'Sehr aktiv (6-7 Tage/Woche)' },
                  { value: 'extra_active', label: 'Extrem aktiv (täglich + körperliche Arbeit)' },
                ]}
              />

              <Select
                label="Hauptziel"
                value={formData.goal || ''}
                onChange={(e) => handleInputChange('goal', e.target.value as Profile['goal'])}
                options={[
                  { value: '', label: 'Dein Ziel wählen' },
                  { value: 'lose_weight', label: 'Gewicht verlieren' },
                  { value: 'maintain_weight', label: 'Gewicht halten' },
                  { value: 'gain_weight', label: 'Gewicht zunehmen' },
                  { value: 'build_muscle', label: 'Muskeln aufbauen' },
                ]}
              />
            </div>
          </div>

          {estimatedCalories > 0 && (
            <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Deine geschätzten Tagesziele</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{estimatedCalories}</div>
                  <div className="text-sm text-gray-600">Kalorien</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{macroTargets.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{macroTargets.carbs}g</div>
                  <div className="text-sm text-gray-600">Kohlenhydrate</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{macroTargets.fat}g</div>
                  <div className="text-sm text-gray-600">Fett</div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-4 p-3 bg-gray-50 rounded-xl">
                <strong>Hinweis:</strong> Dies sind Schätzungen basierend auf der Mifflin-St Jeor Gleichung. 
                Individuelle Bedürfnisse können variieren. Konsultiere einen Arzt für personalisierte Beratung.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={!formData.age || !formData.gender || !formData.height_cm || !formData.weight_kg || !formData.activity_level || !formData.goal}
              className="flex-1"
            >
              Profil speichern
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
