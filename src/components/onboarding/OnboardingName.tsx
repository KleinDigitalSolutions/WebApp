'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingName() {
  const { currentStep, setCurrentStep, firstName, setFirstName, lastName, setLastName } = useOnboardingStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const local = getOnboardingData()
    if (local.firstName) setFirstName(local.firstName)
    if (local.lastName) setLastName(local.lastName)
  }, [setFirstName, setLastName])

  useEffect(() => {
    saveOnboardingData({
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
    })
  }, [firstName, lastName])

  const handleNext = () => {
    if (!firstName || !lastName) {
      setError('Bitte gib Vor- und Nachnamen an.')
      return
    }
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
        <h1 className="text-2xl font-bold text-center mb-6">Wie heißt du?</h1>
        <input
          className="mb-4 w-full max-w-xs px-4 py-3 rounded-xl border"
          placeholder="Vorname"
          value={firstName || ''}
          onChange={e => setFirstName(e.target.value)}
        />
        <input
          className="mb-8 w-full max-w-xs px-4 py-3 rounded-xl border"
          placeholder="Nachname"
          value={lastName || ''}
          onChange={e => setLastName(e.target.value)}
        />
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <button
          onClick={handleNext}
          disabled={!firstName || !lastName}
          className="w-full py-4 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
        >
          Weiter
        </button>
      </div>
    </div>
  )
}
