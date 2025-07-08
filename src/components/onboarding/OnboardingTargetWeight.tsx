'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export default function OnboardingTargetWeight() {
  const { currentStep, setCurrentStep, weight, setTargetWeight } = useOnboardingStore()
  const [error, setError] = useState<string | null>(null)
  const [localTargetWeight, setLocalTargetWeight] = useState<number>(weight || 70)

  useEffect(() => {
    // Beim Mounten: Zielgewicht und Startgewicht aus localStorage laden
    const local = getOnboardingData()
    if (typeof local.targetWeight === 'number' && !isNaN(local.targetWeight)) {
      setLocalTargetWeight(local.targetWeight)
      setTimeout(() => {
        const scroll = document.querySelector('[aria-label="Zielgewicht auswählen"]') as HTMLDivElement;
        if (scroll) {
          const targetVal = local.targetWeight;
          if (typeof targetVal === 'number') {
            const index = Array.from({ length: 151 }, (_, i) => 40 + i).indexOf(targetVal);
            if (index !== -1) {
              const itemHeight = scroll.scrollHeight / 151;
              scroll.scrollTo({
                top: index * itemHeight - scroll.clientHeight / 2 + itemHeight / 2,
                behavior: 'instant',
              });
            }
          }
        }
      }, 50)
    }
  }, [])

  // Bei Änderung speichern & validieren
  useEffect(() => {
    saveOnboardingData({ targetWeight: localTargetWeight })
    if (localTargetWeight < 30 || localTargetWeight > 300) {
      setError('Bitte gib ein realistisches Zielgewicht zwischen 30 und 300 kg an.')
    } else {
      setError(null)
    }
  }, [localTargetWeight])

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  // Defensive: fallback for weight
  const local = getOnboardingData();
  const safeWeight = (typeof local.weight === 'number' && !isNaN(local.weight)) ? local.weight : (typeof weight === 'number' && !isNaN(weight) ? weight : 70);
  const weightLossPercentage = safeWeight > 0 
    ? Math.round((safeWeight - localTargetWeight) / safeWeight * 100 * 10) / 10
    : 0

  const handleNext = async () => {
    if (localTargetWeight < 30 || localTargetWeight > 300) {
      setError('Bitte gib ein realistisches Zielgewicht zwischen 30 und 300 kg an.')
      return
    }
    setTargetWeight(localTargetWeight) // Only update global state here!
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

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-8">
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 leading-tight">Was ist dein Zielgewicht?</h1>
        </div>
        
        {/* Target Weight Selector */}
        <motion.div
          className="relative w-full max-w-xs h-64 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center mb-8"
          variants={itemVariants}
        >
          <div className="absolute inset-y-0 w-full flex items-center justify-center pointer-events-none">
            <div className="h-10 border-y-2 border-emerald-500 w-full bg-emerald-50 opacity-70"></div>
          </div>
          <div
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar py-24"
            tabIndex={0}
            aria-label="Zielgewicht auswählen"
            role="listbox"
          >
            {Array.from({ length: 151 }, (_, i) => 40 + i).map(value => (
              <div
                key={value}
                className={`snap-center h-16 flex items-center justify-center text-4xl font-bold transition-all duration-150 ease-in-out
                  ${localTargetWeight === value ? 'text-emerald-600' : 'text-gray-400 opacity-50'}`}
                role="option"
                aria-selected={localTargetWeight === value}
                data-value={value}
              >
                {value} kg
              </div>
            ))}
          </div>
        </motion.div>

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
            disabled={!localTargetWeight}
            className={`w-full py-4 rounded-full font-semibold text-white bg-emerald-500 ${!localTargetWeight ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}
