'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingGender() {
  const { currentStep, setCurrentStep, setGender } = useOnboardingStore()
  const [localGender, setLocalGender] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const local = getOnboardingData()
    if (local.gender) setLocalGender(local.gender)
  }, [])

  useEffect(() => {
    if (localGender) saveOnboardingData({ gender: localGender })
  }, [localGender])

  const handleNext = () => {
    if (!localGender) {
      setError('Bitte wähle ein Geschlecht aus.')
      return
    }
    setGender(localGender)
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
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welches Geschlecht hast du?</h1>
        <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
          <button
            className={`py-3 rounded-xl border text-lg font-semibold ${localGender === 'male' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800'}`}
            onClick={() => setLocalGender('male')}
          >
            Männlich
          </button>
          <button
            className={`py-3 rounded-xl border text-lg font-semibold ${localGender === 'female' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800'}`}
            onClick={() => setLocalGender('female')}
          >
            Weiblich
          </button>
          <button
            className={`py-3 rounded-xl border text-lg font-semibold ${localGender === 'other' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800'}`}
            onClick={() => setLocalGender('other')}
          >
            Divers
          </button>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <button
          onClick={handleNext}
          disabled={!localGender}
          className="w-full py-4 rounded-full font-semibold text-white bg-emerald-500"
        >
          Weiter
        </button>
      </div>
    </div>
  )
}
