'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, Dumbbell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExerciseSet {
  id: number
  reps: number
  weight: number
}

export default function LogExercisePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deviceName = searchParams.get('device') || 'Training'

  const [sets, setSets] = useState<ExerciseSet[]>([
    { id: 1, reps: 12, weight: 50 }
  ])
  const [saving, setSaving] = useState(false)

  const addSet = () => {
    const newSet = {
      id: Date.now(),
      reps: sets.length > 0 ? sets[sets.length - 1].reps : 12,
      weight: sets.length > 0 ? sets[sets.length - 1].weight : 50,
    }
    setSets([...sets, newSet])
  }

  const removeSet = (id: number) => {
    setSets(sets.filter(set => set.id !== id))
  }

  const handleSetChange = (id: number, field: 'reps' | 'weight', value: number) => {
    setSets(sets.map(set => set.id === id ? { ...set, [field]: value } : set))
  }

  const handleSave = () => {
    setSaving(true)
    // Hier würde die Logik zum Speichern in Supabase hinkommen.
    // Für die Demo simulieren wir es nur.
    console.log('Saving sets:', sets)
    setTimeout(() => {
      setSaving(false)
      // Nach dem "Speichern" leiten wir zum Aktivitäten-Tab weiter.
      router.push('/courses?tab=activities')
    }, 1500)
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/beinpresse.webp')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      
      <div className="relative z-10 p-4">
        <div className="flex flex-col items-center text-center my-6">
          <Dumbbell className="h-12 w-12 text-emerald-400 mb-4" />
          <h1 className="text-2xl font-bold">{deviceName}</h1>
          <p className="text-gray-400">Trage deine Sätze ein</p>
        </div>

        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {sets.map((set, index) => (
              <motion.div
                key={set.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center gap-3 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700"
              >
                <div className="w-8 h-8 flex-shrink-0 bg-gray-800 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Wdh.</label>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => handleSetChange(set.id, 'reps', parseInt(e.target.value))}
                    className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Gewicht (kg)</label>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => handleSetChange(set.id, 'weight', parseInt(e.target.value))}
                    className="w-full bg-transparent text-white text-lg font-semibold focus:outline-none"
                  />
                </div>
                <button onClick={() => removeSet(set.id)} className="p-2 text-gray-500 hover:text-red-400">
                  <Trash2 className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <button
            onClick={addSet}
            className="w-full py-3 bg-gray-800/50 border border-dashed border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <Plus className="h-5 w-5" />
            Satz hinzufügen
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-600"
          >
            {saving ? 'Speichern...' : 'Training beenden'}
          </button>
        </div>
      </div>
    </div>
  )
}
