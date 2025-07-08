'use client'

import { useState } from 'react'
import { useAuthStore, useOnboardingStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingHeight() {
  const { user } = useAuthStore()
  const { currentStep, setCurrentStep, height, setHeight } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'ft/in'>('cm')

  // Height picker range
  const cmValues = Array.from({ length: 51 }, (_, i) => 150 + i) // 150cm to 200cm
  const visibleCmValues = cmValues.slice(
    Math.max(0, cmValues.indexOf(height) - 3),
    Math.min(cmValues.length, cmValues.indexOf(height) + 4)
  )

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // Save height to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          height_cm: height,
          onboarding_step: currentStep + 1
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      // Proceed to next step
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error('Error saving height:', error)
    } finally {
      setIsLoading(false)
    }
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
        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 mb-6">
            <img 
              src="/public/icons/height-ruler.png" 
              alt="Height"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgM0w5IDRINVY2SDE5VjRIMTVMMTIgM1oiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjxwYXRoIGQ9Ik0xMiAyMUwxNSAyMEgxOVYxOEg1VjIwSDlMMTIgMjFaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJNNyA3SDlWMTBIN1Y3WiIgZmlsbD0iY3VycmVudENvbG9yIi8+PHBhdGggZD0iTTcgMTFIOVYxNEg3VjExWiIgZmlsbD0iY3VycmVudENvbG9yIi8+PHBhdGggZD0iTTcgMTVIOVYxN0g3VjE1WiIgZmlsbD0iY3VycmVudENvbG9yIi8+PHBhdGggZD0iTTExIDdIMTNWMTBIMTFWN1oiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjxwYXRoIGQ9Ik0xMSAxMUgxM1YxNEgxMVYxMVoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjxwYXRoIGQ9Ik0xMSAxNUgxM1YxN0gxMVYxNVoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjxwYXRoIGQ9Ik0xNSA3SDE3VjEwSDE1VjdaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJNMTUgMTFIMTdWMTRIMTVWMTFaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBkPSJNMTUgMTVIMTdWMTdIMTVWMTVaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L3N2Zz4=";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-center">Wie groß bist du?</h1>
        </div>
        
        {/* Height Picker */}
        <div className="w-full max-w-xs mb-8">
          {/* Height Scroller */}
          <div className="relative mx-auto w-40 h-48 overflow-hidden bg-gray-50 rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>
            
            {/* Selection Indicator */}
            <div className="absolute top-1/2 left-0 right-0 h-12 -mt-6 border-y-2 border-emerald-400 bg-gray-100/50 z-0"></div>
            
            {/* Scrollable Values */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {cmValues.map((value) => (
                <div 
                  key={value}
                  onClick={() => setHeight(value)}
                  className={`py-2 text-2xl font-semibold transition-all ${
                    value === height 
                      ? 'text-gray-900 scale-110' 
                      : 'text-gray-400'
                  } ${!visibleCmValues.includes(value) ? 'hidden' : ''}`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
          
          {/* Unit Switcher */}
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => setUnit('cm')}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                unit === 'cm' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => setUnit('ft/in')}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                unit === 'ft/in' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              ft/in
            </button>
          </div>
        </div>

        <div className="mt-auto w-full">
          <button
            onClick={handleNext}
            disabled={isLoading || !height}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              isLoading || !height
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
