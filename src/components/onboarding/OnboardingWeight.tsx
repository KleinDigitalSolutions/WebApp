'use client'

import { useState } from 'react'
import { useAuthStore, useOnboardingStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingWeight() {
  const { user } = useAuthStore()
  const { currentStep, setCurrentStep, weight, setWeight } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [unit, setUnit] = useState<'kg' | 'lbs' | 'st'>('kg')

  // Weight picker range
  const kgValues = Array.from({ length: 151 }, (_, i) => 40 + i) // 40kg to 190kg
  const visibleKgValues = kgValues.slice(
    Math.max(0, kgValues.indexOf(weight) - 3),
    Math.min(kgValues.length, kgValues.indexOf(weight) + 4)
  )

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // Save weight to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          weight_kg: weight,
          onboarding_step: currentStep + 1
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      // Proceed to next step
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error('Error saving weight:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate BMI
  const calculateBMI = (weightKg: number, heightCm: number) => {
    if (!weightKg || !heightCm) return null
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    return bmi
  }

  const getBMICategory = (bmi: number | null) => {
    if (bmi === null) return ''
    if (bmi < 18.5) return 'Untergewicht'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Übergewicht'
    return 'Adipositas'
  }

  const bmi = calculateBMI(weight, useOnboardingStore.getState().height)
  const bmiCategory = getBMICategory(bmi)

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
        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 mb-6">
            <img 
              src="/public/icons/weight-scale.png" 
              alt="Weight"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNkg4QzcuNDQ3NzIgNiA3IDYuNDQ3NzIgNyA3VjE3QzcgMTcuNTUyMyA3LjQ0NzcyIDE4IDggMThIMTZDMTYuNTUyMyAxOCAxNyAxNy41NTIzIDE3IDE3VjdDMTcgNi40NDc3MiAxNi41NTIzIDYgMTYgNloiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNCA1VjNIMTBWNSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEyIDEwVjE0IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTAgMTJIMTQiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-center">Wie viel wiegst du?</h1>
        </div>
        
        {/* Weight Picker */}
        <div className="w-full max-w-xs mb-6">
          {/* Weight Scroller */}
          <div className="relative mx-auto w-40 h-48 overflow-hidden bg-gray-50 rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>
            
            {/* Selection Indicator */}
            <div className="absolute top-1/2 left-0 right-0 h-12 -mt-6 border-y-2 border-emerald-400 bg-gray-100/50 z-0"></div>
            
            {/* Scrollable Values */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {kgValues.map((value) => (
                <div 
                  key={value}
                  onClick={() => setWeight(value)}
                  className={`py-2 text-2xl font-semibold transition-all ${
                    value === weight 
                      ? 'text-gray-900 scale-110' 
                      : 'text-gray-400'
                  } ${!visibleKgValues.includes(value) ? 'hidden' : ''}`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
          
          {/* Unit Switcher */}
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => setUnit('kg')}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                unit === 'kg' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit('lbs')}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                unit === 'lbs' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              lbs
            </button>
            <button
              onClick={() => setUnit('st')}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                unit === 'st' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              st
            </button>
          </div>
        </div>

        {/* BMI Indicator */}
        {bmi !== null && (
          <div className="mb-8 flex items-center bg-gray-50 px-4 py-3 rounded-full">
            <div className="flex items-center mr-2">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-sm">
              <span className="font-medium mr-1">BMI: {bmi.toFixed(1)}</span>
              <span className="text-gray-500">({bmiCategory})</span>
            </div>
          </div>
        )}

        <div className="mt-auto w-full">
          <button
            onClick={handleNext}
            disabled={isLoading || !weight}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              isLoading || !weight
                ? 'bg-gray-300'
                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Speichern...
              </span>
            ) : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  )
}
