'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft, Scale } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

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
    const local = getOnboardingData();
    let initialWeight = 70;
    if (typeof local.weight === 'number' && !isNaN(local.weight)) {
      initialWeight = local.weight;
    } else {
      // Prüfe Zustand als Fallback
      const storeWeight = useOnboardingStore.getState().weight;
      if (typeof storeWeight === 'number' && !isNaN(storeWeight)) {
        initialWeight = storeWeight;
      }
    }
    setLocalWeight(initialWeight);
    setTimeout(() => {
      if (scrollRef.current) {
        const index = kgValues.indexOf(initialWeight);
        if (index !== -1) {
          const itemHeight = scrollRef.current.scrollHeight / kgValues.length;
          scrollRef.current.scrollTo({
            top: index * itemHeight - scrollRef.current.clientHeight / 2 + itemHeight / 2,
            behavior: 'instant',
          });
        }
      }
    }, 50);
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
        <motion.button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="p-2 rounded-full transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
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
            <img
              src="/icons/weight-scale.png"
              alt="Weight"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNkg4QzcuNDQ3NzIgNiA3IDYuNDQ3NzIgNyA3VjE3QzcgMTcuNTUyMyA3LjQ0NzcyIDE4IDggMThIMTZDMTYuNTUyMyAxOCAxNyAxNy41NTIzIDE3IDE3VjdDMTcgNi40NDc3MiAxNi41NTIzIDYgMTYgNloiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNCA1VjNIMTBWNSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEyIDEwVjE0IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpa2d0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEwIDEySDE0IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpa2d0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+";
              }}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 leading-tight">Wie viel wiegst du?</h1>
        </div>
        {/* Weight Picker */}
        <motion.div
          className="relative w-full max-w-xs h-64 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center mb-8"
          variants={itemVariants}
        >
          <Scale className="absolute top-4 left-4 w-6 h-6 text-gray-400" />
          <div className="absolute inset-y-0 w-full flex items-center justify-center pointer-events-none">
            <div className="h-10 border-y-2 border-emerald-500 w-full bg-emerald-50 opacity-70"></div>
          </div>
          <div
            ref={scrollRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar py-24"
            onScroll={handleScroll}
            tabIndex={0}
            aria-label="Gewicht auswählen"
            role="listbox"
          >
            {kgValues.map(value => (
              <div
                key={value}
                className={`snap-center h-16 flex items-center justify-center text-4xl font-bold transition-all duration-150 ease-in-out
                  ${localWeight === value ? 'text-emerald-600' : 'text-gray-400 opacity-50'}`}
                role="option"
                aria-selected={localWeight === value}
                data-value={value}
              >
                {value} {unit === 'kg' ? 'kg' : unit === 'lbs' ? 'lbs' : 'st'}
              </div>
            ))}
          </div>
        </motion.div>
        {/* Unit Switcher */}
        <motion.div className="flex space-x-3 bg-gray-200 p-1 rounded-full mb-8 shadow-sm" variants={itemVariants}>
          <motion.button
            onClick={() => setUnit('kg')}
            className={`flex-1 px-5 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out text-base
              ${unit === 'kg' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700'}`}
            whileTap={{ scale: 0.95 }}
            aria-pressed={unit === 'kg'}
          >
            kg
          </motion.button>
          <motion.button
            onClick={() => setUnit('lbs')}
            className={`flex-1 px-5 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out text-base
              ${unit === 'lbs' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700'}`}
            whileTap={{ scale: 0.95 }}
            aria-pressed={unit === 'lbs'}
          >
            lbs
          </motion.button>
          <motion.button
            onClick={() => setUnit('st')}
            className={`flex-1 px-5 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out text-base
              ${unit === 'st' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700'}`}
            whileTap={{ scale: 0.95 }}
            aria-pressed={unit === 'st'}
          >
            st
          </motion.button>
        </motion.div>

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
            className={`w-full max-w-sm py-4 rounded-2xl font-bold text-white text-lg transition-all transform duration-300 ease-in-out
              ${
                typeof localWeight !== 'number' || localWeight < 30 || localWeight > 300 || !!error
                  ? 'bg-gray-300 cursor-not-allowed scale-[0.98]'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 active:scale-[0.97] shadow-lg'
              }
              flex items-center justify-center space-x-2`}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}
