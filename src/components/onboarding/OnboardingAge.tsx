'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingAge() {
  const { currentStep, setCurrentStep, setAge } = useOnboardingStore()
  const [localAge, setLocalAge] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const local = getOnboardingData()
    if (typeof local.age === 'number' && !isNaN(local.age)) setLocalAge(local.age)
  }, [])

  useEffect(() => {
    if (typeof localAge === 'number') {
      saveOnboardingData({ age: localAge })
    }
  }, [localAge])

  const handleNext = () => {
    if (typeof localAge !== 'number' || localAge < 13 || localAge > 120) {
      setError('Bitte gib ein gültiges Alter zwischen 13 und 120 an.')
      return
    }
    setAge(localAge)
    setError(null)
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <button onClick={() => setCurrentStep(currentStep - 1)} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <h1 className="text-2xl font-bold text-center mb-6">Wie alt bist du?</h1>
        <input
          className="mb-8 w-full max-w-xs px-4 py-3 rounded-xl border text-center text-2xl"
          type="number"
          min={13}
          max={120}
          value={localAge}
          onChange={e => setLocalAge(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Alter"
        />
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <button
          onClick={handleNext}
          disabled={typeof localAge !== 'number' || localAge < 13 || localAge > 120}
          className="w-full py-4 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
        >
          Weiter
        </button>
      </div>
    </div>
  )
}
