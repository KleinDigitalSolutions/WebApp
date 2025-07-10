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
  Sparkles
} from 'lucide-react'
import DesktopNotice from '@/components/DesktopNotice'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import { motion, AnimatePresence } from 'framer-motion'

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
      color: 'from-primary-500 to-primary-600',
      gradient: 'linear-gradient(135deg, #34A0A4 0%, #0d9488 100%)'
    },
    {
      icon: QrCode,
      title: 'Barcode-Scanner',
      description: 'Scanne Produkte und erhalte sofort alle Nährwerte',
      color: 'from-primary-600 to-primary-700',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
    },
    {
      icon: Target,
      title: 'Ziel-Tracking',
      description: 'Erreiche deine Ziele mit intelligentem Fortschritts-Tracking',
      color: 'from-primary-400 to-primary-500',
      gradient: 'linear-gradient(135deg, #2dd4bf 0%, #34A0A4 100%)'
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
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        {/* Status Bar Simulation */}
        <div className="h-6 bg-transparent"></div>
        
        {/* Modern Header with Glassmorphism */}
        <motion.header 
          className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg"
          style={{ minHeight: '52px', paddingTop: 'env(safe-area-inset-top, 0.5rem)', paddingBottom: '0.5rem' }}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="px-4 flex items-center justify-between h-full">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">TrackFood</span>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                onClick={() => router.push('/login')}
                className="bg-white/90 text-primary-600 border border-primary-200 font-semibold rounded-2xl px-6 py-2.5 shadow-lg hover:bg-primary-50 hover:shadow-xl transition-all duration-200"
              >
                Anmelden
              </Button>
            </motion.div>
          </div>
        </motion.header>
        
        {/* Platzhalter für Header-Höhe */}
        <div style={{ height: 'calc(52px + env(safe-area-inset-top, 0px))' }}></div>

        {/* Hero Section with Modern Design */}
        <motion.section 
          className="px-6 py-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div 
            className="relative mb-8 flex flex-col items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/25 mb-6">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-secondary-900 leading-tight mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Deine intelligente<br />
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              Ernährungs-App
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-secondary-600 mb-10 max-w-sm mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            KI-gestützte Ernährungsberatung, Barcode-Scanner und personalisierte Empfehlungen – alles in einer App.
          </motion.p>

          <motion.div 
            className="flex flex-col space-y-4 mb-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="font-semibold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0"
            >
              Jetzt kostenlos starten
            </Button>
            
            <GoogleLoginButton />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex items-center justify-center space-x-6 text-sm text-secondary-500 mb-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-accent-success" />
              <span>Kostenlos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-accent-success" />
              <span>KI-gestützt</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-accent-success" />
              <span>Datenschutz</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Interactive Feature Carousel */}
        <motion.section 
          className="px-6 py-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <div className="max-w-sm mx-auto">
            <div
              className="relative h-72 mb-8"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`absolute inset-0 ${
                      index === activeFeature
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: index === activeFeature ? 1 : 0,
                      scale: index === activeFeature ? 1 : 0.9
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div
                      className="rounded-3xl p-8 text-white shadow-2xl h-full flex flex-col justify-center bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl border border-white/20"
                      style={{ 
                        background: feature.gradient,
                        boxShadow: '0 20px 40px 0 rgba(52, 160, 164, 0.15)'
                      }}
                    >
                      <feature.icon className="w-12 h-12 mb-4 mx-auto" />
                      <h3 className="text-xl font-bold mb-2 text-center">{feature.title}</h3>
                      <p className="text-center text-white/90 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Carousel Dots */}
            <div className="flex justify-center space-x-3 mb-8">
              {features.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeFeature
                      ? 'bg-primary-500 w-8'
                      : 'bg-secondary-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Key Features Grid */}
        <motion.section 
          className="px-6 py-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[
              {
                icon: Brain,
                title: 'KI-Beratung',
                subtitle: 'Personalisierte Empfehlungen',
                gradient: 'from-primary-500 to-primary-600'
              },
              {
                icon: QrCode,
                title: 'Barcode-Scanner',
                subtitle: 'Sofort alle Nährwerte',
                gradient: 'from-primary-600 to-primary-700'
              },
              {
                icon: Target,
                title: 'Ziele erreichen',
                subtitle: 'Intelligentes Tracking',
                gradient: 'from-primary-400 to-primary-500'
              },
              {
                icon: TrendingUp,
                title: 'Fortschritte',
                subtitle: 'Visualisierte Erfolge',
                gradient: 'from-primary-500 to-primary-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 2.0 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-secondary-600">{feature.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Social Proof */}
        <motion.section 
          className="px-6 py-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
        >
          <div className="max-w-sm mx-auto">
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-secondary-700 mb-2 font-medium">
              &quot;TrackFood hat meine Ernährung revolutioniert!&quot;
            </p>
            <p className="text-sm text-secondary-500 mb-6">
              Über 10.000 zufriedene Nutzer
            </p>
            
            <div className="flex justify-center items-center space-x-2 mb-8">
              <Users className="w-5 h-5 text-primary-500" />
              <span className="text-sm text-secondary-600">
                Schließe dich der Community an
              </span>
            </div>
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.section 
          className="px-6 py-8 pb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6 }}
        >
          <div className="max-w-sm mx-auto text-center">
            <div
              className="rounded-3xl p-8 text-white shadow-2xl bg-gradient-to-r from-primary-500 to-primary-600"
              style={{ boxShadow: '0 20px 40px 0 rgba(52, 160, 164, 0.15)' }}
            >
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Bereit loszulegen?</h3>
              <p className="text-white/90 mb-6 text-sm">
                Starte deine Reise zu einer gesünderen Ernährung noch heute.
              </p>
              <Button
                onClick={() => router.push('/register')}
                className="font-semibold py-3 px-8 rounded-2xl shadow-lg w-full border-0 bg-white text-primary-600 hover:bg-gray-50"
              >
                Jetzt kostenlos testen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="px-6 py-8 text-center text-secondary-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.8 }}
        >
          <div className="max-w-sm mx-auto">
            <p className="mb-4">&copy; 2025 TrackFood. Alle Rechte vorbehalten.</p>
            <div className="flex justify-center space-x-4 mb-4">
              <a href="/impressum" className="hover:text-primary-600 transition-colors">
                Impressum
              </a>
              <a href="/datenschutz" className="hover:text-primary-600 transition-colors">
                Datenschutz
              </a>
              <a href="/agb" className="hover:text-primary-600 transition-colors">
                AGB
              </a>
            </div>
            <p className="text-xs">
              Ein Produkt von <a href="https://www.kleindigitalsolutions.de" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-600 transition-colors">Klein Digital Solutions</a>
            </p>
          </div>
        </motion.footer>
      </div>
    </>
  )
}