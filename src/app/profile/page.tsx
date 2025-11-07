'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Profile } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Navigation } from '@/components/BottomNavBar'
import { Button, Input, Select, LoadingSpinner } from '@/components/ui'
import { calculateBMI, getBMICategory, calculateDailyCalorieGoal, calculateMacroTargets } from '@/lib/nutrition-utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState<Partial<Profile>>({
    first_name: undefined,
    last_name: undefined,
    age: undefined,
    gender: undefined,
    height_cm: undefined,
    weight_kg: undefined,
    activity_level: undefined,
    fitness_goals: [],
    intolerances: [], // NEU: Unverträglichkeiten
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        // Wichtig: Prüfe als Erstes, ob das Onboarding abgeschlossen ist
        const { data: onboardingCheck, error: onboardingError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle()

        if (onboardingError) {
          console.error('Error checking onboarding status:', onboardingError)
        }

        // Sofortige Weiterleitung zum Onboarding, wenn nicht abgeschlossen
        if (onboardingCheck && !onboardingCheck.onboarding_completed) {
          console.log('Onboarding not completed, redirecting to /onboarding immediately')
          router.push('/onboarding')
          return
        }
        
        // Normale Profilseiten-Logik nur fortsetzen, wenn Onboarding abgeschlossen
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Error loading profile data:', profileError)
        }

        if (data) {
          setProfile(data)
          setFormData(data)
        } else if (!profileError) {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email ?? undefined }])
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile stub:', createError)
          } else if (newProfile) {
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

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setShowSuccess(false)
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
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2500)
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

  const estimatedCalories = formData.age && formData.weight_kg && formData.height_cm && formData.gender && formData.activity_level && formData.fitness_goals && formData.fitness_goals.length > 0
    ? calculateDailyCalorieGoal({ ...formData, goal: formData.fitness_goals[0] } as Profile)
    : 0

  const macroTargets = estimatedCalories > 0 && formData.fitness_goals && formData.fitness_goals.length > 0
    ? calculateMacroTargets(estimatedCalories, formData.fitness_goals[0])
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

  const dietOptions = [
    { value: 'standard', label: 'Standard', emoji: '🥩' },
    { value: 'vegan', label: 'Vegan', emoji: '🥑' },
    { value: 'vegetarian', label: 'Vegetarisch', emoji: '🥦' },
    { value: 'glutenfree', label: 'Glutenfrei', emoji: '🌾' },
    { value: 'keto', label: 'Keto', emoji: '🍣' },
    { value: 'other', label: 'Andere', emoji: '🍽️' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
        <div className="flex items-center justify-center py-12 flex-1 z-10">
          <LoadingSpinner size="lg" />
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Toast-Benachrichtigung */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="fixed top-6 right-6 z-50 shadow-xl rounded-2xl bg-emerald-500 text-white px-6 py-4 flex items-center gap-3 pointer-events-auto"
            style={{ minWidth: 220 }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-semibold text-base">Profil gespeichert!</div>
              <div className="text-xs opacity-80">Deine Änderungen wurden übernommen.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg mx-auto px-2 pt-6 pb-32 flex flex-col gap-6 z-10">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
          className="flex flex-col items-center gap-2 mb-2"
        >
          <div className="w-20 h-20 rounded-full bg-gray-800 shadow-lg border-2 border-gray-700 flex items-center justify-center text-4xl font-bold text-gray-300 mb-1" style={{boxShadow:'0 4px 32px rgba(0,0,0,0.2)'}}>
            {formData.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-xl font-bold text-gray-100 text-center">{formData.first_name} {formData.last_name}</div>
          {formData.fitness_goals && formData.fitness_goals.length > 0 && (
            <div className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white shadow border border-emerald-400 mb-1">🎯 Ziel: {(() => {
              switch(formData.fitness_goals[0]) {
                case 'lose_weight': return 'Abnehmen';
                case 'maintain_weight': return 'Gewicht halten';
                case 'gain_weight': return 'Zunehmen';
                case 'build_muscle': return 'Muskelaufbau';
                default: return formData.fitness_goals[0];
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
            className="bg-gray-900 rounded-3xl border border-gray-800 shadow-lg p-6"
          >
            <h2 className="text-lg font-bold text-gray-100 mb-4">Persönliche Daten</h2>
            
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
              <div className="mt-4 p-4 bg-emerald-900/50 rounded-xl border border-emerald-800">
                <p className="text-sm text-emerald-300">
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
            className="bg-gray-900 rounded-3xl border border-gray-800 shadow-lg p-6"
          >
            <h2 className="text-lg font-bold text-gray-100 mb-4">Aktivität & Ziele</h2>
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
                value={formData.fitness_goals?.[0] || ''}
                onChange={(e) => handleInputChange('fitness_goals', [e.target.value])}
                options={[
                  { value: '', label: 'Dein Ziel wählen' },
                  { value: 'lose_weight', label: 'Gewicht verlieren' },
                  { value: 'maintain_weight', label: 'Gewicht halten' },
                  { value: 'gain_weight', label: 'Gewicht zunehmen' },
                  { value: 'build_muscle', label: 'Muskeln aufbauen' },
                ]}
              />

              {/* Ernährungspräferenz Auswahl */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ernährungspräferenz</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {dietOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleInputChange('diet_type', opt.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold text-base
                        ${(formData.diet_type === opt.value) ? 'border-emerald-500 bg-emerald-900/50 text-emerald-300 scale-105' : 'border-gray-700 bg-gray-800 text-gray-200 hover:border-gray-600 hover:bg-gray-700'}`}
                      aria-pressed={formData.diet_type === opt.value}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!formData.is_glutenfree}
                    onChange={e => handleInputChange('is_glutenfree', Boolean(e.target.checked))}
                    className="w-5 h-5 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-2xl">🌾</span>
                  <span className="text-base font-medium text-gray-200">Glutenfrei</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Geschätzte Tagesziele */}
          {estimatedCalories > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
              className="bg-gray-900 rounded-3xl border border-gray-800 shadow-lg p-6"
            >
              <h2 className="text-lg font-bold text-gray-100 mb-4">Deine geschätzten Tagesziele</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-300">{estimatedCalories}</div>
                  <div className="text-sm text-gray-400">Kalorien</div>
                </div>
                <div className="text-center p-4 bg-emerald-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-300">{macroTargets.protein}g</div>
                  <div className="text-sm text-gray-400">Protein</div>
                </div>
                <div className="text-center p-4 bg-emerald-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-300">{macroTargets.carbs}g</div>
                  <div className="text-sm text-gray-400">Kohlenhydrate</div>
                </div>
                <div className="text-center p-4 bg-emerald-900/50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-300">{macroTargets.fat}g</div>
                  <div className="text-sm text-gray-400">Fett</div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 p-3 bg-gray-800 rounded-xl">
                <strong>Hinweis:</strong> Dies sind Schätzungen basierend auf der Mifflin-St Jeor Gleichung. 
                Individuelle Bedürfnisse können variieren. Konsultiere einen Arzt für personalisierte Beratung.
              </p>
            </motion.div>
          )}

          {/* Produktverwaltung */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-100 mb-4">Community & Produkte</h2>
            <div className="space-y-3">
              <div 
                onClick={() => router.push('/products/add')}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">➕</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200">Produkt hinzufügen</h3>
                    <p className="text-sm text-gray-400">Hilf der Community mit neuen Produkten</p>
                  </div>
                </div>
                <span className="text-blue-400">→</span>
              </div>
              <div 
                onClick={() => router.push('/products/my')}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200">Meine Produkte</h3>
                    <p className="text-sm text-gray-400">Übersicht deiner hinzugefügten Produkte</p>
                  </div>
                </div>
                <span className="text-green-400">→</span>
              </div>
            </div>
          </div>

          {/* Unverträglichkeiten */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-100 mb-4">Unverträglichkeiten</h2>
            <div className="flex flex-wrap gap-3">
              {intoleranceOptions.map((item) => (
                <label key={item} className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-xl cursor-pointer border border-gray-700">
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
                    className="bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-gray-200 font-medium">{item}</span>
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
              disabled={!formData.first_name || !formData.last_name || !formData.age || !formData.gender || !formData.height_cm || !formData.weight_kg || !formData.activity_level || !formData.fitness_goals || formData.fitness_goals.length === 0}
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