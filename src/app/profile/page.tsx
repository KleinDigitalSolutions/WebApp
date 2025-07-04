'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Profile } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, Input, Select, LoadingSpinner } from '@/components/ui'
import { calculateBMI, getBMICategory, calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Profile>>({
    first_name: undefined,
    last_name: undefined,
    age: undefined,
    gender: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    activity_level: undefined,
    goal: undefined,
    intolerances: [], // NEU: Unverträglichkeiten
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

  const intoleranceOptions = [
    'Laktose',
    'Gluten',
    'Nüsse',
    'Soja',
    'Ei',
    'Fisch',
    'Sellerie',
    'Senf',
    'Sesam',
    'Erdnuss',
    'Weichtiere',
    'Sulfite',
    'Lupine',
    'Fruktose',
    'Histamin',
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Liquid Glass Animated Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 120% 80% at 60% 10%, #059669cc 0%, #064e3b 60%, #0e172a 100%)',
            filter: 'blur(0px) saturate(1.2)',
            transition: 'background 1s',
          }}
        />
        <div className="flex items-center justify-center py-12 flex-1 z-10">
          <LoadingSpinner size="lg" />
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Liquid Glass Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 60% 10%, #059669cc 0%, #064e3b 60%, #0e172a 100%)',
          filter: 'blur(0px) saturate(1.2)',
          transition: 'background 1s',
        }}
      />
      {/* Subtle animated glass waves */}
      <motion.div
        className="absolute -bottom-24 left-0 w-full h-48 z-0 pointer-events-none"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            'linear-gradient(120deg, #a7f3d0cc 0%, #6ee7b7bb 40%, #05966988 100%)',
          filter: 'blur(32px) saturate(1.3)',
        }}
      />
      <div className="w-full max-w-lg mx-auto px-2 pt-6 pb-32 flex flex-col gap-6 z-10">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
          className="flex flex-col items-center gap-2 mb-2"
        >
          <div className="w-20 h-20 rounded-full bg-white/40 shadow-lg border-2 border-emerald-200 flex items-center justify-center text-4xl font-bold text-emerald-700 backdrop-blur-2xl mb-1" style={{boxShadow:'0 4px 32px #05966933'}}>
            {formData.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-xl font-bold text-white drop-shadow text-center">{formData.first_name} {formData.last_name}</div>
          {formData.goal && (
            <div className="text-xs px-3 py-1 rounded-full bg-emerald-600/80 text-white shadow border border-emerald-200 mb-1">🎯 Ziel: {(() => {
              switch(formData.goal) {
                case 'lose_weight': return 'Abnehmen';
                case 'maintain_weight': return 'Gewicht halten';
                case 'gain_weight': return 'Zunehmen';
                case 'build_muscle': return 'Muskelaufbau';
                default: return formData.goal;
              }
            })()}</div>
          )}
        </motion.div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Persönliche Daten */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
            className="rounded-3xl border border-white/30 bg-white/30 shadow-2xl backdrop-blur-2xl p-6"
            style={{boxShadow:'0 8px 40px 0 #05966933'}}
          >
            <h2 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-800 bg-clip-text drop-shadow">Persönliche Daten</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vorname"
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Dein Vorname"
                  required
                />
                
                <Input
                  label="Nachname"
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Dein Nachname"
                  required
                />
              </div>

              <Input
                label="Alter"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                placeholder="Dein Alter eingeben"
                min="13"
                max="120"
                required
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
          </motion.div>

          {/* Aktivität & Ziele */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
            className="rounded-3xl border border-white/30 bg-white/30 shadow-2xl backdrop-blur-2xl p-6"
            style={{boxShadow:'0 8px 40px 0 #05966933'}}
          >
            <h2 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-800 bg-clip-text drop-shadow">Aktivität & Ziele</h2>
            
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
          </motion.div>

          {/* Geschätzte Tagesziele */}
          {estimatedCalories > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
              className="rounded-3xl border border-white/30 bg-white/30 shadow-2xl backdrop-blur-2xl p-6"
              style={{boxShadow:'0 8px 40px 0 #05966933'}}
            >
              <h2 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-800 bg-clip-text drop-shadow">Deine geschätzten Tagesziele</h2>
              
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
            </motion.div>
          )}

          {/* Produktverwaltung */}
          <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-blue-100 shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Community & Produkte</h2>
            
            <div className="space-y-3">
              <div 
                onClick={() => router.push('/products/add')}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">➕</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Produkt hinzufügen</h3>
                    <p className="text-sm text-gray-600">Hilf der Community mit neuen Produkten</p>
                  </div>
                </div>
                <span className="text-blue-500">→</span>
              </div>

              <div 
                onClick={() => router.push('/products/my')}
                className="flex items-center justify-between p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Meine Produkte</h3>
                    <p className="text-sm text-gray-600">Übersicht deiner hinzugefügten Produkte</p>
                  </div>
                </div>
                <span className="text-green-500">→</span>
              </div>
            </div>
          </div>

          {/* Unverträglichkeiten */}
          <div className="backdrop-blur-sm bg-white/50 rounded-2xl border border-green-100 shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Unverträglichkeiten</h2>
            <div className="flex flex-wrap gap-3">
              {intoleranceOptions.map((item) => (
                <label key={item} className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl cursor-pointer border border-green-100">
                  <input
                    type="checkbox"
                    checked={formData.intolerances?.includes(item) || false}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        intolerances: e.target.checked
                          ? [...(prev.intolerances || []), item]
                          : (prev.intolerances || []).filter(i => i !== item)
                      }))
                    }}
                  />
                  <span className="text-sm text-green-800">{item}</span>
                </label>
              ))}
            </div>
          </div>

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
              disabled={!formData.first_name || !formData.last_name || !formData.age || !formData.gender || !formData.height_cm || !formData.weight_kg || !formData.activity_level || !formData.goal}
              className="flex-1"
            >
              Profil speichern
            </Button>
          </div>
        </form>
      </div>
      
      <Navigation />
    </div>
  )
}
