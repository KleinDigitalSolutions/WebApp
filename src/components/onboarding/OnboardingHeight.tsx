'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft, Ruler } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { motion } from 'framer-motion'

export default function OnboardingHeight() {
  const { currentStep, setCurrentStep, setHeight } = useOnboardingStore()
  const [unit, setUnit] = useState<'cm' | 'ft/in'>('cm')
  const [error, setError] = useState<string | null>(null)
  const [localHeight, setLocalHeight] = useState<number>(175)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Height picker range
  const cmValues = Array.from({ length: 151 }, (_, i) => 100 + i) // 100cm to 250cm

  // On mount: load from localStorage or Zustand
  useEffect(() => {
    const local = getOnboardingData()
    if (typeof local.height === 'number' && !isNaN(local.height)) {
      setLocalHeight(local.height)
    }
  }, [])

  // Save to localStorage & validate on change
  useEffect(() => {
    saveOnboardingData({ height: localHeight })
    if (localHeight < 100 || localHeight > 250) {
      setError('Bitte gib eine realistische Größe zwischen 100 und 250 cm an.')
    } else {
      setError(null)
    }
  }, [localHeight])

  // Auto-Snap-Funktion nach dem Scrollen
  const snapToClosestValue = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    let closestValue = localHeight;
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
    if (closestValue !== localHeight) {
      setLocalHeight(closestValue);
      const selectedElement = container.querySelector(`[data-value="${closestValue}"]`);
      if (selectedElement) {
        (selectedElement as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [localHeight]);

  // Scroll-Handler mit Debounce
  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      snapToClosestValue();
    }, 150);
  }, [snapToClosestValue]);

  // Initial scroll to current height
  useEffect(() => {
    if (scrollRef.current && localHeight) {
      const index = cmValues.indexOf(localHeight);
      if (index !== -1) {
        const itemHeight = scrollRef.current.scrollHeight / cmValues.length;
        scrollRef.current.scrollTo({
          top: index * itemHeight - scrollRef.current.clientHeight / 2 + itemHeight / 2,
          behavior: 'instant', // instant for initial load
        });
      }
    }
  }, [cmValues, localHeight]); // Ensure this effect runs when cmValues or localHeight changes

  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(`[data-value="${localHeight}"]`) as HTMLElement;
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
  }, [localHeight, handleScroll, snapToClosestValue])

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = async () => {
    if (localHeight < 100 || localHeight > 250) {
      setError('Bitte gib eine realistische Größe zwischen 100 und 250 cm an.')
      return
    }
    setHeight(localHeight) // Only update global state here!
    setCurrentStep(currentStep + 1)
  }

  // Framer Motion Animation Variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full transition-colors duration-200"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
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
            <img 
              src="/public/icons/height-ruler.png" 
              alt="Height"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHJ4PSI0IiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iNSIgeT0iNSIgd2lkdGg9IjEiIGhlaWdodD0iMTQiIGZpbGw9IiM3N2UiLz48cmVjdCB4PSIxMiIgeT0iNSIgd2lkdGg9IjEiIGhlaWdodD0iMTQiIGZpbGw9IiM3N2UiLz48cmVjdCB4PSIxOSIgeT0iNSIgd2lkdGg9IjEiIGhlaWdodD0iMTQiIGZpbGw9IiM3N2UiLz48L3N2Zz4=";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-center">Wie groß bist du?</h1>
        </div>
        
        {/* Height Picker */}
        <motion.div
          className="relative w-full max-w-xs h-64 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center mb-8"
          variants={itemVariants}
        >
          <Ruler className="absolute top-4 left-4 w-6 h-6 text-gray-400" />
          <div className="absolute inset-y-0 w-full flex items-center justify-center pointer-events-none">
            <div className="h-10 border-y-2 border-emerald-500 w-full bg-emerald-50 opacity-70"></div>
          </div>
          <div
            ref={scrollRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar py-24"
            onScroll={handleScroll}
            tabIndex={0}
            aria-label="Größe auswählen"
            role="listbox"
          >
            {cmValues.map(value => (
              <div
                key={value}
                className={`snap-center h-16 flex items-center justify-center text-4xl font-bold transition-all duration-150 ease-in-out
                  ${localHeight === value ? 'text-emerald-600' : 'text-gray-400 opacity-50'}`}
                role="option"
                aria-selected={localHeight === value}
              >
                {value} {unit === 'cm' ? 'cm' : 'ft/in'}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Unit Toggle - cm / ft/in */}
        <motion.div className="flex space-x-3 bg-gray-200 p-1 rounded-full mb-8 shadow-sm" variants={itemVariants}>
          <motion.button
            onClick={() => { setUnit('cm'); }}
            className={`flex-1 px-5 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out text-base
              ${unit === 'cm' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700'}`}
            whileTap={{ scale: 0.95 }}
            aria-pressed={unit === 'cm'}
          >
            cm
          </motion.button>
          <motion.button
            onClick={() => { setUnit('ft/in'); }}
            className={`flex-1 px-5 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out text-base
              ${unit === 'ft/in' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700'}`}
            whileTap={{ scale: 0.95 }}
            aria-pressed={unit === 'ft/in'}
          >
            ft/in
          </motion.button>
        </motion.div>

        <div className="flex justify-center w-full max-w-xs">
          <button 
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center justify-center space-x-2"
          >
            <span>Weiter</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
