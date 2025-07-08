'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import {
  QrCode,
  Brain,
  ArrowRight,
  Target,
  Zap,
  TrendingUp,
  Users,
  Check,
  Star,
  Play
} from 'lucide-react'
import DesktopNotice from '@/components/DesktopNotice'
import GoogleLoginButton from '@/components/GoogleLoginButton'

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
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'KI-Ernährungsberatung',
      description: 'Intelligente Analyse deiner Ernährung mit personalisierten Empfehlungen',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: QrCode,
      title: 'Barcode-Scanner',
      description: 'Scanne Produkte und erhalte sofort alle Nährwerte',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Ziel-Tracking',
      description: 'Erreiche deine Ziele mit intelligentem Fortschritts-Tracking',
      color: 'from-emerald-500 to-teal-500'
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
      // Nur auslösen, wenn horizontale Bewegung deutlich größer als vertikale ist
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) {
          // swipe left
          setActiveFeature((prev) => (prev + 1) % features.length)
        } else {
          // swipe right
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
      
      <div className="min-h-screen bg-[#ffffff] overflow-hidden">
        {/* Status Bar Simulation */}
        <div className="h-6 bg-transparent"></div>
        
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-800">TrackFood</span>
          </div>
          <Button
            onClick={() => router.push('/login')}
            variant="ghost"
            className="text-gray-600 hover:text-emerald-600 font-medium"
          >
            Anmelden
          </Button>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-8 text-center">
          <div className="relative mb-2 flex flex-col items-center justify-center">
            <img
              src="/SVG/logo.webp"
              alt="TrackFood Logo"
              className="w-48 h-48 mx-auto object-contain animate-spin-slow"
              style={{ animationDuration: '8s', animationTimingFunction: 'linear' }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-2">
            Deine intelligente<br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Ernährungs-App
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed mt-2">
            KI-gestützte Ernährungsberatung, Barcode-Scanner und personalisierte Empfehlungen – alles in einer App.
          </p>

          <div className="flex flex-col space-y-4 mb-8">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Jetzt kostenlos starten
            </Button>
            
            <GoogleLoginButton />
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Kostenlos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>KI-gestützt</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Datenschutz</span>
            </div>
          </div>
        </section>

        {/* Interactive Feature Carousel */}
        <section className="px-6 py-8">
          <div className="max-w-sm mx-auto">
            <div
              className="relative h-64 mb-6"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-400 ${
                    index === activeFeature
                      ? 'opacity-100'
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className={`bg-gradient-to-br ${feature.color} rounded-3xl p-8 text-white shadow-2xl h-full flex flex-col justify-center`}>
                    <feature.icon className="w-12 h-12 mb-4 mx-auto" />
                    <h3 className="text-xl font-bold mb-2 text-center">{feature.title}</h3>
                    <p className="text-center text-white/90 leading-relaxed">{feature.description}</p>
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
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeFeature
                      ? 'bg-emerald-500 w-8'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="px-6 py-8">
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">KI-Beratung</h3>
              <p className="text-xs text-gray-600">Personalisierte Empfehlungen</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Barcode-Scanner</h3>
              <p className="text-xs text-gray-600">Sofort alle Nährwerte</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Ziele erreichen</h3>
              <p className="text-xs text-gray-600">Intelligentes Tracking</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Fortschritte</h3>
              <p className="text-xs text-gray-600">Visualisierte Erfolge</p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="px-6 py-8 text-center">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-2">
              &quot;TrackFood hat meine Ernährung revolutioniert!&quot;
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Über 10.000 zufriedene Nutzer
            </p>
            
            <div className="flex justify-center items-center space-x-2 mb-8">
              <Users className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-gray-600">
                Schließe dich der Community an
              </span>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 py-8 pb-12">
          <div className="max-w-sm mx-auto text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-2xl">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Bereit loszulegen?</h3>
              <p className="text-white/90 mb-6 text-sm">
                Starte deine Reise zu einer gesünderen Ernährung noch heute.
              </p>
              <Button
                onClick={() => router.push('/register')}
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl shadow-lg w-full"
              >
                Jetzt kostenlos testen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center text-gray-500 text-sm">
          <div className="max-w-sm mx-auto">
            <p className="mb-4">&copy; 2025 TrackFood. Alle Rechte vorbehalten.</p>
            <div className="flex justify-center space-x-4 mb-4">
              <a href="/impressum" className="hover:text-emerald-600 transition-colors">
                Impressum
              </a>
              <a href="/datenschutz" className="hover:text-emerald-600 transition-colors">
                Datenschutz
              </a>
              <a href="/agb" className="hover:text-emerald-600 transition-colors">
                AGB
              </a>
            </div>
            <p className="text-xs">
              Ein Produkt von Klein Digital Solutions
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}