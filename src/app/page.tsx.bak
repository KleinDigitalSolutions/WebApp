'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import {
  QrCode,
  Dumbbell,
  ArrowRight,
  Trophy,
  Zap,
  Users,
  Check,
  Star,
  Calendar,
  Lock,
  Sparkles,
  Heart,
  Activity
} from 'lucide-react'
import DesktopNotice from '@/components/DesktopNotice'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [showDesktopNotice, setShowDesktopNotice] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    setShowDesktopNotice(true)
  }, [])

  useEffect(() => {
    // Feature carousel auto-rotation
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: QrCode,
      title: 'QR Check-in',
      description: 'Blitzschneller Zugang ins Studio - einfach scannen und loslegen',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)'
    },
    {
      icon: Dumbbell,
      title: 'Training Tracking',
      description: 'Automatische Erfassung deiner Workouts und Fortschritte',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
    },
    {
      icon: Calendar,
      title: 'Kursbuchung',
      description: 'Buche deine Lieblingskurse direkt in der App',
      gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
    },
    {
      icon: Sparkles,
      title: 'AI Fitness Coach',
      description: 'Dein persönlicher KI-Trainer für Workouts und Ernährung',
      gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)'
    }
  ]

  // Touch/Swipe-Logik für das Feature-Carousel
  const touchStart = useRef<{x: number, y: number} | null>(null)
  const touchEnd = useRef<{x: number, y: number} | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }
  }
  const handleTouchEnd = () => {
    if (touchStart.current && touchEnd.current) {
      const dx = touchEnd.current.x - touchStart.current.x
      const dy = touchEnd.current.y - touchStart.current.y
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) {
          setActiveFeature((prev) => (prev + 1) % features.length)
        } else {
          setActiveFeature((prev) => (prev - 1 + features.length) % features.length)
        }
      }
    }
    touchStart.current = null
    touchEnd.current = null
  }

  if (user) {
    return null
  }

  return (
    <>
      {showDesktopNotice && <DesktopNotice />}

      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Status Bar Simulation */}
        <div className="h-6 bg-transparent"></div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between"
                style={{ minHeight: '60px', paddingTop: 'env(safe-area-inset-top, 0.75rem)', paddingBottom: '0.75rem' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              A.N.D <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">LETICS</span>
            </span>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full px-6 py-2 shadow-lg hover:shadow-orange-500/50 transition-all duration-200"
          >
            Login
          </Button>
        </header>

        {/* Platzhalter für Header-Höhe */}
        <div style={{ height: 'calc(60px + env(safe-area-inset-top, 0px))' }}></div>

        {/* Hero Section */}
        <section className="px-6 py-12 text-center relative z-10">
          <div className="relative mb-6 flex flex-col items-center justify-center">
            {/* Animated Logo */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <Dumbbell className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
            A.N.D <br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 animate-pulse"
            >
              LETICS
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-3 max-w-md mx-auto leading-relaxed">
            Dein Fitness-Studio der Zukunft
          </p>

          <p className="text-base text-gray-400 mb-10 max-w-sm mx-auto leading-relaxed">
            QR Check-in, AI Coach, automatisches Training-Tracking und vieles mehr - alles in einer App.
          </p>

          <div className="flex flex-col space-y-4 mb-8 max-w-sm mx-auto">
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="font-bold py-6 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg"
              style={{
                background: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 50%, #FF6B35 100%)',
                backgroundSize: '200% 100%',
                color: '#fff',
                border: 'none',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            >
              <Zap className="w-6 h-6 mr-2 inline" />
              Enter Demo
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Keine Anmeldung erforderlich - Demo direkt erleben
            </p>
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: 200% 0%; }
              50% { background-position: 0% 0%; }
              100% { background-position: 200% 0%; }
            }
          `}</style>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mb-8">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>24/7 Zugang</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>AI-gestützt</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Smart Tech</span>
            </div>
          </div>
        </section>

        {/* Interactive Feature Carousel */}
        <section className="px-6 py-8 relative z-10">
          <div className="max-w-sm mx-auto">
            <div
              className="relative h-72 mb-6"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === activeFeature
                      ? 'opacity-100'
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div
                    className="rounded-3xl p-8 text-white shadow-2xl h-full flex flex-col justify-center relative overflow-hidden"
                    style={{ background: feature.gradient }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-center">{feature.title}</h3>
                      <p className="text-center text-white/90 leading-relaxed text-lg">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center space-x-2 mb-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeFeature
                      ? 'bg-orange-500 w-8'
                      : 'bg-gray-600 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="px-6 py-8 relative z-10">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Alles was du brauchst
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {/* Feature Card 1 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Check-in</h3>
              <p className="text-xs text-gray-400">QR-Code scannen</p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Live Tracking</h3>
              <p className="text-xs text-gray-400">Workouts erfassen</p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Kurse</h3>
              <p className="text-xs text-gray-400">Einfach buchen</p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Smart Locker</h3>
              <p className="text-xs text-gray-400">Digitale Spinde</p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Challenges</h3>
              <p className="text-xs text-gray-400">Ziele erreichen</p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">Ernährung</h3>
              <p className="text-xs text-gray-400">AI-Berater</p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="px-6 py-8 text-center relative z-10">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 mb-2 text-lg font-medium">
              &quot;Das modernste Fitness-Studio das ich kenne!&quot;
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Über 500+ aktive Mitglieder
            </p>

            <div className="flex justify-center items-center space-x-3 mb-8">
              <Users className="w-6 h-6 text-orange-500" />
              <span className="text-sm text-gray-400">
                Werde Teil der Community
              </span>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 py-8 pb-12 relative z-10">
          <div className="max-w-sm mx-auto text-center">
            <div className="relative rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Bereit durchzustarten?</h3>
                <p className="text-white/90 mb-6 text-base">
                  Erlebe die Demo und entdecke die Zukunft des Trainings.
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="font-bold py-4 px-8 rounded-xl shadow-lg w-full border-2 border-white/20 hover:border-white/40 transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#FF6B35',
                    fontWeight: 800
                  }}
                >
                  Enter Demo jetzt
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center text-gray-500 text-sm relative z-10 border-t border-gray-800">
          <div className="max-w-sm mx-auto">
            <p className="mb-4 text-gray-400">&copy; 2025 A.N.D LETICS. Alle Rechte vorbehalten.</p>
            <div className="flex justify-center space-x-4 mb-4">
              <a href="/impressum" className="hover:text-orange-500 transition-colors">
                Impressum
              </a>
              <a href="/datenschutz" className="hover:text-orange-500 transition-colors">
                Datenschutz
              </a>
              <a href="/agb" className="hover:text-orange-500 transition-colors">
                AGB
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
