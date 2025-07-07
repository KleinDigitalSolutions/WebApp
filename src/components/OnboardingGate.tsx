"use client"

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import OnboardingModal from '@/components/OnboardingModal'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, profile, setProfile } = useAuthStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      // Prüfe, ob justLoggedIn im LocalStorage gesetzt ist
      const justLoggedIn = typeof window !== 'undefined' && localStorage.getItem('justLoggedIn') === 'true'
      setShowOnboarding(data?.show_onboarding && justLoggedIn)
      setLoading(false)
    }
    fetchProfile()
  }, [user, setProfile])

  const handleFinish = async () => {
    setShowOnboarding(false)
    if (user && profile) {
      await supabase.from('profiles').update({ show_onboarding: false }).eq('id', user.id)
      setProfile({ ...profile, show_onboarding: false })
    }
    // Flag nach Onboarding entfernen
    if (typeof window !== 'undefined') {
      localStorage.removeItem('justLoggedIn')
    }
  }

  if (loading) return null
  return <>{showOnboarding && <OnboardingModal onFinish={handleFinish} />}{children}</>
}
