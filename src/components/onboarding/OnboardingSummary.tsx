'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useOnboardingStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function OnboardingSummary() {
  const router = useRouter()
  const { user, setProfile } = useAuthStore()
  const { 
    userGoals, 
    height, 
    weight, 
    targetWeight
  } = useOnboardingStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [targetDate, setTargetDate] = useState('')
  const weightDifference = weight && targetWeight ? weight - targetWeight : 0

  useEffect(() => {
    if (weight && targetWeight) {
      // Calculate reasonable weight loss
      const weightToLose = weight - targetWeight
      
      // ~0.5-1kg per week is healthy
      const lossPerWeek = weightToLose > 10 ? 0.8 : 0.5
      const weeksNeeded = Math.max(1, Math.ceil(weightToLose / lossPerWeek))
      const targetDateObj = new Date()
      targetDateObj.setDate(targetDateObj.getDate() + (weeksNeeded * 7))
      
      // Format date as DD.MM.YY
      setTargetDate(targetDateObj.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }))
    }
  }, [weight, targetWeight])

  const handleBack = () => {
    const { setCurrentStep } = useOnboardingStore.getState()
    setCurrentStep(4)  // Go back to target weight step
  }

  const handleComplete = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      // Calculate age if birth date is set
      const birthDate = useOnboardingStore.getState().birthDate
      let age = null
      if (birthDate) {
        const birthYear = new Date(birthDate).getFullYear()
        const currentYear = new Date().getFullYear()
        age = currentYear - birthYear
      }
      
      // Determine activity level and goal
      const activityLevel = 'lightly_active'
      let goal = 'lose_weight'
      if (weight <= targetWeight) {
        goal = 'maintain_weight'
      }
      if (weight < targetWeight) {
        goal = 'gain_weight'
      }
      
      // Save all user data and complete onboarding
      const profileData = {
        height_cm: height,
        weight_kg: weight,
        target_weight_kg: targetWeight,
        goals: userGoals,
        activity_level: activityLevel,
        goal: goal,
        age: age,
        onboarding_completed: true,
        onboarding_step: 5
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
      
      if (error) throw error
      
      if (data && data.length > 0) {
        // Update local profile
        setProfile(data[0])
      }
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
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

      <div className="flex-1 flex flex-col px-4 pb-8">
        <h1 className="text-2xl font-bold text-center mb-2">Dein Weg</h1>
        <p className="text-gray-600 text-center mb-8">
          Wir haben einen personalisierten Plan für dich erstellt
        </p>
        
        {/* Summary Chart */}
        <div className="w-full bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="aspect-square relative">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              {/* Base Grid */}
              <line x1="10" y1="170" x2="190" y2="170" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="10" y1="10" x2="10" y2="170" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Weight Line */}
              <path 
                d={`M 10,${170 - weight} C 50,${180 - weight} 70,${150 - (weight + targetWeight) / 2} 190,${170 - targetWeight}`} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
              />
              
              {/* Calorie Line */}
              <path 
                d="M 10,120 C 60,100 100,60 190,40" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
              />
              
              {/* Dots */}
              <circle cx="10" cy={170 - weight} r="5" fill="#10b981" />
              <circle cx="190" cy={170 - targetWeight} r="5" fill="#10b981" />
              
              {/* Labels */}
              <text x="10" y="190" textAnchor="middle" fontSize="8" fill="#6b7280">Heute</text>
              <text x="190" y="190" textAnchor="middle" fontSize="8" fill="#6b7280">{targetDate}</text>
              
              <text x="100" y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">Kaloriendefizit</text>
              <text x="100" y={170 - (weight + targetWeight) / 2 + 20} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#10b981">Gewicht</text>
            </svg>
          </div>
        </div>
        
        {/* Summary Info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6l0 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18l.01 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {weightDifference > 0 ? `${weightDifference} kg zu verlieren ist ein vernünftiges Ziel!` : 'Dein Ziel ist realistisch!'}
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Erreicht am {targetDate}</div>
                <div className="text-sm text-gray-500">Vorhersage basierend auf deinem Profil</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 7l9 6l9 -6" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Wöchentliche Fortschrittsberichte</div>
                <div className="text-sm text-gray-500">Du erhältst Feedback zu deiner Entwicklung</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 10c-.5 -1 -2.5 -1 -3 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 10c-.5 -1 -2.5 -1 -3 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 15l6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Individuelle KI-Beratung</div>
                <div className="text-sm text-gray-500">Unser KI-Coach unterstützt dich auf deinem Weg</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto w-full">
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
              isLoading
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
                Wird eingerichtet...
              </span>
            ) : "Jetzt starten"}
          </button>
        </div>
      </div>
    </div>
  )
}
