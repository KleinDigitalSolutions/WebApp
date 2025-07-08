'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Button, Input } from '@/components/ui'
import { Heart, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        setSuccess(true)
        // If user is immediately confirmed, redirect to profile setup
        if (data.user.email_confirmed_at) {
          setUser(data.user)
          router.push('/profile')
        }
      }
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
          redirectTo: `${window.location.origin}/profile`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Registrierung mit Google fehlgeschlagen')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">E-Mail prüfen</h2>
            <p className="mt-2 text-sm text-gray-600">
              Wir haben einen Bestätigungslink an <strong>{email}</strong> gesendet
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
            </p>
            <div className="mt-6">
              <Link href="/login" className="font-medium text-green-600">
                Zurück zur Anmeldung
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center py-8 px-2">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="w-full px-4">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="w-7 h-7 text-emerald-500" />
              <span className="sr-only">Zurück zur Startseite</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-sm w-full space-y-8 backdrop-blur-md bg-white/90 rounded-3xl shadow-2xl p-8 border-none mx-auto mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Kostenlos registrieren</h2>
          <p className="text-gray-600 mb-6">Starte heute deine Ernährungsreise</p>
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
              className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Passwort erstellen"
              className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <Input
              label="Passwort bestätigen"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Passwort bestätigen"
              className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <Button
            type="submit"
            loading={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-2xl font-semibold shadow-lg active:scale-95 transition-all duration-200 text-lg"
          >
            Konto erstellen
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Oder fortfahren mit</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full border-gray-200 bg-white text-gray-700 py-3 rounded-2xl font-semibold shadow active:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google registrieren
          </Button>
          <div className="text-center pt-4">
            <span className="text-gray-600">
              Bereits ein Konto?{' '}
              <Link href="/login" className="font-semibold text-emerald-600 hover:underline">Anmelden</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
