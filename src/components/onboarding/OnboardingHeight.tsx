'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft } from 'lucide-react'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'

export default function OnboardingHeight() {
  const { currentStep, setCurrentStep, height, setHeight } = useOnboardingStore()
  const [unit, setUnit] = useState<'cm' | 'ft/in'>('cm')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  // Height picker range
  const cmValues = Array.from({ length: 51 }, (_, i) => 150 + i) // 150cm to 200cm
  
  // Auto-Snap-Funktion nach dem Scrollen
  const snapToClosestValue = useCallback(() => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    
    let closestValue = height;
    let minDistance = Infinity;
    
    // Alle Wert-Elemente durchgehen und das nächste zum Zentrum finden
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
    
    // Den nächsten Wert auswählen und dorthin scrollen
    if (closestValue !== height) {
      setHeight(closestValue);
      
      // Zum ausgewählten Element scrollen
      const selectedElement = container.querySelector(`[data-value="${closestValue}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [height, setHeight]);
  
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
    // Beim Mounten: Wert aus localStorage laden
    const local = getOnboardingData()
    if (local.height && local.height !== height) {
      setHeight(local.height)
    } else if (!height) {
      setHeight(175)
    }
    
    // Scrolle zum aktuellen Wert wenn die Komponente mounted
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector(`[data-value="${height}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
      
      // Event-Listener für Scroll hinzufügen
      scrollRef.current.addEventListener('scroll', handleScroll);
      
      // Touch-Events für bessere mobile Erfahrung
      scrollRef.current.addEventListener('touchend', snapToClosestValue);
      
      // Cleanup
      return () => {
        if (scrollRef.current) {
          scrollRef.current.removeEventListener('scroll', handleScroll);
          scrollRef.current.removeEventListener('touchend', snapToClosestValue);
        }
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }
  }, [height, setHeight, handleScroll, snapToClosestValue])

  // Bei Änderung speichern & validieren
  useEffect(() => {
    if (height) {
      saveOnboardingData({ height })
      if (height < 100 || height > 250) {
        setError('Bitte gib eine realistische Größe zwischen 100 und 250 cm an.')
      } else {
        setError(null)
      }
    }
  }, [height])

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = async () => {
    if (height < 100 || height > 250) {
      setError('Bitte gib eine realistische Größe zwischen 100 und 250 cm an.')
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
            <img 
              src="/public/icons/height-ruler.png" 
              alt="Height"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist
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
            
            {/* Selection Indicator */}
            <div className="absolute top-1/2 left-0 right-0 h-12 -mt-6 border-y-2 border-emerald-400 bg-gray-100/50 z-0 pointer-events-none"></div>
            
            {/* Scrollable Values - jetzt mit automatischer Auswahl */}
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
                    setHeight(value)
                    const element = document.querySelector(`[data-value="${value}"]`) as HTMLElement
                    if (element) {
                      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
                    }
                  }}
                  className={`py-2 text-2xl font-semibold transition-all touch-manipulation ${
                    value === height 
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
            disabled={!height}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              !height
                ? 'bg-gray-300'
                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
            }`}
          >
            {error ? error : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  )
}
