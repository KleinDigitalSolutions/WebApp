'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useOnboardingStore } from '@/store'
import { supabase } from '@/lib/supabase'
import OnboardingGoals from '@/components/onboarding/OnboardingGoals'
import OnboardingHeight from '@/components/onboarding/OnboardingHeight'
import OnboardingWeight from '@/components/onboarding/OnboardingWeight'
import OnboardingTargetWeight from '@/components/onboarding/OnboardingTargetWeight'
import OnboardingSummary from '@/components/onboarding/OnboardingSummary'
import OnboardingName from '@/components/onboarding/OnboardingName'
import OnboardingAge from '@/components/onboarding/OnboardingAge'
import OnboardingGender from '@/components/onboarding/OnboardingGender'

export default function OnboardingPage() {
  const { user, setProfile } = useAuthStore()
  const { currentStep, setCurrentStep } = useOnboardingStore()
  const router = useRouter()

  // Redirect user if onboarding is already completed
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user profile exists and onboarding is completed
    const checkOnboardingStatus = async () => {
      console.log("Checking onboarding status for user:", user.id)
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        console.log("Profile data:", data)

        if (error) {
          console.error("Error fetching profile:", error)
          // Bei Fehler versuchen wir, ein Profil zu erstellen
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            onboarding_completed: false,
            onboarding_step: 1,
            show_onboarding: true
          })
          
          if (insertError) {
            console.error("Failed to create profile:", insertError)
          } else {
            setCurrentStep(1)
          }
          return
        }

        if (data) {
          setProfile(data)
          if (data.onboarding_completed) {
            console.log("Onboarding completed, redirecting to dashboard")
            router.push('/dashboard')
          } else if (data.onboarding_step > 0) {
            // Resume from last step
            console.log("Resuming onboarding from step:", data.onboarding_step)
            setCurrentStep(data.onboarding_step)
          } else {
            console.log("Starting onboarding from step 1")
            setCurrentStep(1)
            
            // Aktualisiere den Onboarding-Schritt auf 1, falls er 0 ist
            if (data.onboarding_step === 0) {
              await supabase
                .from('profiles')
                .update({ onboarding_step: 1 })
                .eq('id', user.id)
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      }
    }

    checkOnboardingStatus()
  }, [user, router, setProfile, setCurrentStep])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingName />
      case 2:
        return <OnboardingAge />
      case 3:
        return <OnboardingGender />
      case 4:
        return <OnboardingGoals />
      case 5:
        return <OnboardingHeight />
      case 6:
        return <OnboardingWeight />
      case 7:
        return <OnboardingTargetWeight />
      case 8:
        return <OnboardingSummary />
      default:
        return <OnboardingName />
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1">
        <div 
          className="bg-emerald-500 h-1 transition-all duration-300"
          style={{ width: `${(currentStep / 8) * 100}%` }}
        ></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {renderStep()}
      </div>
    </div>
  )
}
