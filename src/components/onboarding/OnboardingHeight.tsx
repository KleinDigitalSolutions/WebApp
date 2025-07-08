'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'

export default function OnboardingHeight() {
  const { currentStep, setCurrentStep, setHeight } = useOnboardingStore()
  const [unit, setUnit] = useState<'cm' | 'ft/in'>('cm')
  const [error, setError] = useState<string | null>(null)
  const [localHeight, setLocalHeight] = useState<number>(175)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Height picker range
  const cmValues = Array.from({ length: 51 }, (_, i) => 150 + i) // 150cm to 200cm

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
        <div className="w-full max-w-xs mb-8">
          {/* Height Scroller */}
          <div className="relative mx-auto w-40 h-48 bg-gray-50 rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 right-0 h-12 -mt-6 border-y-2 border-emerald-400 bg-gray-100/50 z-0 pointer-events-none"></div>
            <div 
              ref={scrollRef}
              className="absolute inset-0 flex flex-col items-center overflow-y-auto scrollbar-hide py-16"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {cmValues.map((value) => (
                <div 
                  key={value}
                  data-value={value}
                  onClick={() => {
                    setLocalHeight(value)
                    const element = document.querySelector(`[data-value="${value}"]`) as HTMLElement
                    if (element) {
                      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
                    }
                  }}
                  className={`cursor-pointer text-center text-2xl font-semibold transition-all duration-200 ease-in-out ${localHeight === value ? 'text-emerald-600' : 'text-gray-800'}`}
                  style={{ opacity: localHeight === value ? 1 : 0.6 }}
                >
                  {value} {unit === 'cm' ? 'cm' : 'ft/in'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unit Toggle - cm / ft/in */}
        <div className="flex space-x-2 mb-8">
          <button 
            onClick={() => setUnit('cm')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out ${unit === 'cm' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            cm
          </button>
          <button 
            onClick={() => setUnit('ft/in')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out ${unit === 'ft/in' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            ft/in
          </button>
        </div>

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
