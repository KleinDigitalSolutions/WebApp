'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'

export default function OnboardingTargetWeight() {
  const { 
    currentStep, 
    setCurrentStep, 
    weight, 
    height,
    targetWeight, 
    setTargetWeight 
  } = useOnboardingStore()
  const [recommendedRange, setRecommendedRange] = useState<[number, number]>([0, 0])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Calculate healthy BMI range (18.5 - 24.9)
    if (height) {
      const heightInMeters = height / 100
      const minWeight = Math.round(18.5 * heightInMeters * heightInMeters)
      const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters)
      setRecommendedRange([minWeight, maxWeight])
    }
  }, [height])

  useEffect(() => {
    // Beim Mounten: Zielgewicht aus localStorage laden
    const local = getOnboardingData()
    if (local.targetWeight && local.targetWeight !== targetWeight) {
      setTargetWeight(local.targetWeight)
    }
  }, [setTargetWeight, targetWeight])

  // Bei Änderung speichern & validieren
  useEffect(() => {
    if (targetWeight) {
      saveOnboardingData({ targetWeight })
      if (targetWeight < 30 || targetWeight > 300) {
        setError('Bitte gib ein realistisches Zielgewicht zwischen 30 und 300 kg an.')
      } else {
        setError(null)
      }
    }
  }, [targetWeight])

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const increaseWeight = () => {
    setTargetWeight(targetWeight + 1)
  }

  const decreaseWeight = () => {
    if (targetWeight > 40) {
      setTargetWeight(targetWeight - 1)
    }
  }

  const weightLossPercentage = weight > 0 
    ? Math.round((weight - targetWeight) / weight * 100 * 10) / 10
    : 0

  const handleNext = async () => {
    if (targetWeight < 30 || targetWeight > 300) {
      setError('Bitte gib ein realistisches Zielgewicht zwischen 30 und 300 kg an.')
      return
    }
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <button 
          onClick={handleBack}
          className="p-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Tooltip/Hinweis */}
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 mb-6">
            <svg className="w-full h-full text-amber-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.25495L8.90699 8.25495L11.993 2.00195L15.079 8.25495L21.979 9.25495L16.979 14.122L18.158 20.995L12 17.75Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center">Was ist dein Zielgewicht?</h1>
        </div>
        
        {/* Target Weight Selector */}
        <div className="w-full max-w-xs mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={decreaseWeight}
              className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
            >
              <Minus className="w-8 h-8" />
            </button>
            
            <div className="font-bold text-4xl">{targetWeight} kg</div>
            
            <button 
              onClick={increaseWeight}
              className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
          
          <div className="mt-4 text-sm text-center text-gray-500">
            Empfohlen: {recommendedRange[0]} kg - {recommendedRange[1]} kg
          </div>
        </div>

        {/* Info Box */}
        <div className="w-full mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" stroke="currentColor" strokeWidth="2" />
                <path d="M13 17l0 .01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 13l1 0l0 -5l-1 .5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 13l-1 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="font-semibold text-gray-800">Transformatives Ziel</div>
            </div>
            
            <div className="text-gray-700 mb-3">
              Du wirst <span className="font-semibold text-emerald-600">{weightLossPercentage}%</span> deines Körpergewichts verlieren
            </div>
            
            <div className="text-sm text-gray-600">
              Du wirst nachhaltige Gesundheitsverbesserungen sehen:
            </div>
            
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Verbesserung der Herzgesundheit und Verringerung des Diabetesrisikos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Verbesserung der Gelenkigkeit und Steigerung der Beweglichkeit</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-auto w-full">
          <button
            onClick={handleNext}
            disabled={!targetWeight}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              !targetWeight
                ? 'bg-gray-300'
                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
            }`}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}
