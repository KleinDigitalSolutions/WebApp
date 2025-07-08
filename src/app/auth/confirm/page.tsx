'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DeprecatedConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Diese Seite wird nicht mehr benötigt, da keine E-Mail-Bestätigung mehr erfolgt
    // Bei Aufruf dieser Seite: Prüfen, ob der Benutzer angemeldet ist und entsprechend weiterleiten
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Prüfen, ob Onboarding abgeschlossen ist
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()
        
        if (profile && !profile.onboarding_completed) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Falls kein Benutzer angemeldet ist, zur Anmeldeseite weiterleiten
        router.push('/login')
      }
    }
    
    checkSession()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Weiterleitung...</p>
        </div>
      </div>
    </div>
  )
}
