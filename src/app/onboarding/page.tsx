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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        if (data.onboarding_completed) {
          router.push('/dashboard')
        } else if (data.onboarding_step > 0) {
          // Resume from last step
          setCurrentStep(data.onboarding_step)
        }
      }
    }

    checkOnboardingStatus()
  }, [user, router, setProfile, setCurrentStep])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingGoals />
      case 2:
        return <OnboardingHeight />
      case 3:
        return <OnboardingWeight />
      case 4:
        return <OnboardingTargetWeight />
      case 5:
        return <OnboardingSummary />
      default:
        return <OnboardingGoals />
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
          style={{ width: `${(currentStep / 5) * 100}%` }}
        ></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {renderStep()}
      </div>
    </div>
  )
}
