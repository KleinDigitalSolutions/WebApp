'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'

export default function OnboardingWeight() {
  const { currentStep, setCurrentStep, setWeight } = useOnboardingStore()
  const [unit, setUnit] = useState<'kg' | 'lbs' | 'st'>('kg')
  const [error, setError] = useState<string | null>(null)
  const [localWeight, setLocalWeight] = useState<number>(70)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Weight picker range
  const kgValues = Array.from({ length: 151 }, (_, i) => 40 + i) // 40kg to 190kg

  // On mount: load from localStorage or Zustand
  useEffect(() => {
    const local = getOnboardingData()
    if (typeof local.weight === 'number' && !isNaN(local.weight)) {
      setLocalWeight(local.weight)
    }
  }, [])

  // Save to localStorage & validate on change
  useEffect(() => {
    saveOnboardingData({ weight: localWeight })
    if (localWeight < 30 || localWeight > 300) {
      setError('Bitte gib ein realistisches Gewicht zwischen 30 und 300 kg an.')
    } else {
      setError(null)
    }
  }, [localWeight])

  // Auto-Snap-Funktion nach dem Scrollen
  const snapToClosestValue = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    let closestValue = localWeight;
    let minDistance = Infinity;
    const elements = container.children;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        const dataValue = element.dataset.value;
        if (dataValue) {
          closestValue = parseInt(dataValue, 10);
        }
      }
    }
    if (closestValue !== localWeight) {
      setLocalWeight(closestValue);
      const selectedElement = container.querySelector(`[data-value="${closestValue}"]`);
      if (selectedElement) {
        (selectedElement as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [localWeight]);

  // Scroll-Handler mit Debounce
  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      snapToClosestValue();
    }, 150);
  }, [snapToClosestValue]);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(`[data-value="${localWeight}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
      scrollRef.current.addEventListener('scroll', handleScroll);
      scrollRef.current.addEventListener('touchend', snapToClosestValue);
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
        scrollRef.current.removeEventListener('touchend', snapToClosestValue);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [localWeight, handleScroll, snapToClosestValue])

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = async () => {
    if (localWeight < 30 || localWeight > 300) {
      setError('Bitte gib ein realistisches Gewicht zwischen 30 und 300 kg an.')
      return
    }
    setWeight(localWeight) // Only update global state here!
    setCurrentStep(currentStep + 1)
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

  // Defensive: fallback for height
  const height = typeof useOnboardingStore.getState().height === 'number' && !isNaN(useOnboardingStore.getState().height)
    ? useOnboardingStore.getState().height
    : 175
  // Defensive: fallback for localWeight
  const safeWeight = typeof localWeight === 'number' && !isNaN(localWeight) ? localWeight : 70
  const bmi = calculateBMI(safeWeight, height)
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
        {/* Tooltip/Hinweis */}
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 mb-6">
            <img 
              src="/public/icons/weight-scale.png" 
              alt="Weight"
              className="w-full h-full object-contain"
              onError={(e) => {
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
          <div className="relative mx-auto w-40 h-48 bg-gray-50 rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 right-0 h-12 -mt-6 border-y-2 border-emerald-400 bg-gray-100/50 z-0 pointer-events-none"></div>
            <div 
              ref={scrollRef}
              className="absolute inset-0 flex flex-col items-center overflow-y-auto scrollbar-hide py-16"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {kgValues.map((value) => (
                <div 
                  key={value}
                  data-value={value}
                  onClick={() => {
                    setLocalWeight(value)
                    const element = document.querySelector(`[data-value="${value}"]`) as HTMLElement
                    if (element) {
                      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
                    }
                  }}
                  className={`py-2 text-2xl font-semibold transition-all touch-manipulation ${
                    value === localWeight 
                      ? 'text-gray-900 scale-110' 
                      : 'text-gray-400'
                  }`}
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
        {bmi !== null && isFinite(bmi) && (
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
            disabled={!localWeight}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              !localWeight
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
