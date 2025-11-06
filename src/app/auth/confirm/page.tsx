'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!isMounted) return

      if (session?.user) {
        router.push('/onboarding')
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black p-6 text-center">
      <div className="max-w-lg w-full bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-xl p-10 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Bitte bestätige deine E-Mail</h1>
          <p className="text-gray-400">Wir haben dir soeben eine Nachricht geschickt. Klicke auf den Bestätigungslink, um dein Konto zu aktivieren.</p>
        </div>

        {email && (
          <div className="bg-gray-800/60 border border-gray-700 text-gray-300 rounded-xl px-4 py-3">
            <p>Gesendet an <span className="font-medium text-white">{email}</span></p>
          </div>
        )}

        <div className="text-sm text-gray-500 space-y-3">
          <p>Nach der Bestätigung leiten wir dich automatisch weiter.</p>
          <p>Kein Mail erhalten? Prüfe auch den Spam-Ordner oder fordere eine neue Bestätigung über die Login-Seite an.</p>
        </div>

        <div className="flex items-center justify-center space-x-3 text-emerald-400 text-sm">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></div>
          <span>Warten auf Bestätigung…</span>
        </div>
      </div>
    </div>
  )
}
