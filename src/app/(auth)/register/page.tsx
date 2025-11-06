'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Button, Input } from '@/components/ui'
import { ArrowLeft, Dumbbell } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuthStore()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein')
      setLoading(false)
      return
    }

    try {
      // Registrierung ohne E-Mail-Bestätigung
      const normalizedEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            // Zusätzliche Benutzerdaten können hier hinzugefügt werden
          }
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user && data.session) {
        // Benutzer ist bereits angemeldet (keine E-Mail-Bestätigung erforderlich)
        await new Promise(resolve => setTimeout(resolve, 500))
        await supabase.from('profiles').update({
          email: data.user.email,
          onboarding_completed: false,
          onboarding_step: 1
        }).eq('id', data.user.id)

        setUser(data.user)
        router.push('/onboarding')
        return
      }

      // E-Mail-Bestätigung erforderlich
      router.push(`/auth/confirm?email=${encodeURIComponent(normalizedEmail)}`)
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }

      // Wir können hier kein Profil erstellen, da wir die User-ID noch nicht haben.
      // Dies muss im Callback-Handler erfolgen.

    } catch {
      setError('Registrierung mit Google fehlgeschlagen')
    }
  }

  // Nach der E-Mail-Bestätigung prüfen, ob der Benutzer automatisch eingeloggt ist
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          console.log('User is already logged in after email confirmation')
          setUser(session.user)

          // Wenn das Profil bereits existiert, zum Onboarding weiterleiten
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profile && !profile.onboarding_completed) {
            router.push('/onboarding')
          } else {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
      }
    }

    checkAuthStatus()
  }, [router, setUser])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center py-4 px-2">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="w-full px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="w-7 h-7 text-orange-500" />
              <span className="sr-only">Zurück zur Startseite</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Inhalt ohne Karte */}
      <div className="w-full max-w-sm mx-auto mt-10 space-y-8 relative z-10">
        <div className="text-center">
          {/* Fitness Logo - Hantel Icon */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-28 h-28 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Dumbbell className="w-14 h-14 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Mitglied werden bei <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">A.N.D LETICS</span>
          </h2>
          <p className="text-gray-400 mb-6">Starte deine Fitness-Reise noch heute</p>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <Input
              label="E-Mail-Adresse"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Deine E-Mail-Adresse"
              className="rounded-xl border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
            />
            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Passwort erstellen"
              className="rounded-xl border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
            />
            <Input
              label="Passwort bestätigen"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Passwort bestätigen"
              className="rounded-xl border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-2xl font-semibold shadow-lg active:scale-95 transition-all duration-200 text-lg"
          >
            Konto erstellen
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-500 font-medium">Oder fortfahren mit</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full border-gray-700 bg-gray-900/50 text-white py-3 rounded-2xl font-semibold shadow hover:bg-gray-800/50 flex items-center justify-center gap-2"
          >
            {/* Farbiges Google-Logo */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path fill="#4285F4" d="M43.611 20.083h-1.861V20H24v8h11.303c-1.627 4.657-6.084 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c2.938 0 5.625 1.047 7.747 2.773l6.571-6.571C34.625 5.266 29.641 3 24 3 12.954 3 4 11.954 4 23s8.954 20 20 20c11.045 0 20-8.954 20-20 0-1.341-.138-2.651-.389-3.917z"/>
                <path fill="#34A853" d="M6.306 14.691l6.571 4.822C14.625 16.047 19.047 13 24 13c2.938 0 5.625 1.047 7.747 2.773l6.571-6.571C34.625 5.266 29.641 3 24 3c-7.732 0-14.41 4.41-17.694 11.691z"/>
                <path fill="#FBBC05" d="M24 43c5.421 0 10.406-2.266 14.318-5.928l-6.627-5.428C29.625 34.953 27.047 36 24 36c-5.219 0-9.676-3.343-11.303-8H6.306C9.59 38.59 16.268 43 24 43z"/>
                <path fill="#EA4335" d="M43.611 20.083h-1.861V20H24v8h11.303c-0.703 2.012-2.047 3.734-3.612 4.644l6.627 5.428C41.953 35.047 44 29.641 44 24c0-1.341-.138-2.651-.389-3.917z"/>
              </g>
            </svg>
            Mit Google registrieren
          </Button>

          <div className="text-center pt-4">
            <span className="text-gray-400">
              Bereits ein Konto?{' '}
              <Link href="/login" className="font-semibold text-orange-500 hover:underline">
                Anmelden
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
