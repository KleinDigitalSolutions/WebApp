'use client'

import { useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { ArrowLeft, Scale } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'

interface GoalOption {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
}

export default function OnboardingGoals() {
  const { currentStep, setCurrentStep, userGoals, setUserGoals } = useOnboardingStore()
  const router = useRouter()

  // Fallback: userGoals immer als Array initialisieren
  const safeUserGoals = Array.isArray(userGoals) ? userGoals : []

  const goalOptions: GoalOption[] = [
    {
      id: 'weight_loss',
      label: 'Gewichtsverlust',
      icon: <div className="bg-blue-100 p-3 rounded-lg"><Scale className="w-5 h-5 text-blue-500" /></div>
    },
    {
      id: 'improved_health',
      label: 'Verbesserte Gesundheit',
      icon: <div className="bg-red-100 p-3 rounded-lg">
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
        </svg>
      </div>
    },
    {
      id: 'more_energy',
      label: 'Mehr Energie',
      icon: <div className="bg-blue-100 p-3 rounded-lg">
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />
        </svg>
      </div>
    },
    {
      id: 'mental_wellbeing',
      label: 'Mentales Wohlbefinden',
      icon: <div className="bg-purple-100 p-3 rounded-lg">
        <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
          <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
        </svg>
      </div>
    },
    {
      id: 'better_digestion',
      label: 'Bessere Verdauung',
      icon: <div className="bg-indigo-100 p-3 rounded-lg">
        <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.235 5.196a9 9 0 1 0 9.033 -1.196a9 9 0 0 0 -9.033 1.196z" />
          <path d="M9 7.5l4.254 2.773l-1.736 5.727l-4.254 -2.773z" />
        </svg>
      </div>
    },
    {
      id: 'immune_system',
      label: 'Immunsystem stärken',
      icon: <div className="bg-cyan-100 p-3 rounded-lg">
        <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 16a3 3 0 0 1 -3 -3v-4a3 3 0 0 1 6 0v4" />
          <path d="M19 8v8a3 3 0 0 1 -6 0v-8" />
          <path d="M12 6a4 4 0 0 1 8 0v1a4 4 0 0 1 -8 0v-1z" />
          <path d="M4 9a4 4 0 0 0 8 0v-1a4 4 0 0 0 -8 0v1z" />
        </svg>
      </div>
    },
  ]

  const toggleGoal = (goalId: string) => {
    if (safeUserGoals.includes(goalId)) {
      setUserGoals(safeUserGoals.filter(id => id !== goalId))
    } else {
      setUserGoals([...safeUserGoals, goalId])
    }
  }

  useEffect(() => {
    // Beim Mounten: Ziele aus localStorage laden
    const local = getOnboardingData()
    if (local.userGoals && Array.isArray(local.userGoals) && local.userGoals.length > 0) {
      setUserGoals(local.userGoals)
    }
  }, [setUserGoals])

  // Bei Änderung speichern
  useEffect(() => {
    if (Array.isArray(userGoals)) saveOnboardingData({ userGoals })
  }, [userGoals])

  const handleNext = async () => {
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <button 
          onClick={() => router.push('/login')}
          className="p-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 pb-8">
        <h1 className="text-2xl font-bold text-center mb-8">Was sind deine Ziele?</h1>
        
        <div className="space-y-3 mb-8">
          {goalOptions.map((goal) => (
            <div 
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                safeUserGoals.includes(goal.id) 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center">
                {goal.icon}
                <span className="ml-3 font-medium">{goal.label}</span>
              </div>
              <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                safeUserGoals.includes(goal.id) 
                  ? 'bg-emerald-500 text-white' 
                  : 'border border-gray-300'
              }`}>
                {safeUserGoals.includes(goal.id) && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleNext}
            disabled={safeUserGoals.length === 0}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              safeUserGoals.length === 0
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
