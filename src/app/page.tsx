'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import {
  QrCode,
  Brain,
  Database,
  ArrowRight,
  ChevronDown
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const targetName = "TrackFood"

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])
  if (user) {
    return null
  }
  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .hero-title-glow {
          position: relative;
        }
        .hero-title-glow::before {
          content: attr(data-text);
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          filter: blur(30px);
          opacity: 0.1;
          z-index: -1;
          pointer-events: none;
          font-size: inherit;
          font-weight: inherit;
          letter-spacing: inherit;
          white-space: nowrap;
          color: #10b981;
        }
        .trackfood-animate {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          animation: trackfoodFadeUp 1.1s cubic-bezier(.33,1.02,.47,.98) 0.1s forwards;
        }
        @keyframes trackfoodFadeUp {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .scroll-bounce {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scroll-bounce-text, .scroll-bounce-chevron {
          animation: scrollBounce 2.2s cubic-bezier(.45,0,.55,1) infinite;
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(12px); }
          60% { transform: translateY(0); }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50" style={{ scrollBehavior: 'smooth' }}>
        {/* Hero Section */}
        <section className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center z-10">
            <div className="mb-8">
              <h1 
                className="text-6xl md:text-8xl font-bold text-white mb-4 hero-title-glow trackfood-animate" 
                data-text={targetName}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  justifyContent: 'center',
                  perspective: '1000px'
                }}
              >
                {targetName}
              </h1>
              <div className="w-24 h-1 bg-white mx-auto rounded-full" />
            </div>
            <p className="text-xl text-emerald-100 mb-12 max-w-md mx-auto font-light">
              Intelligente Ernährung für deine Gesundheit
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="scroll-bounce text-white/80">
              <span className="text-sm mb-2 font-light scroll-bounce-text">Scroll für mehr</span>
              <ChevronDown className="w-6 h-6 scroll-bounce-chevron" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Alles was du für eine gesunde Ernährung brauchst
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Von intelligentem Barcode-Scanning bis hin zu personalisierten KI-Empfehlungen – 
                TrackFood macht gesunde Ernährung einfach und smart.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {/* Feature 1: Barcode Scanner */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Barcode-Scanner</h3>
                <p className="text-gray-600 leading-relaxed">
                  Scanne jeden Barcode und erhalte sofort Nährwerte! Mit 2500+ deutschen Produkten 
                  (Ferrero, Milka, EDEKA, REWE, ALDI) in unserer Datenbank.
                </p>
                <div className="mt-4 text-sm text-emerald-600 font-medium">
                  Mobile & Safari optimiert • PWA-kompatibel
                </div>
              </div>

              {/* Feature 2: KI-Ernährungsberatung */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">KI-Ernährungsberatung</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chatte mit unserem KI-Experten! Erhalte personalisierte Empfehlungen basierend auf 
                  deiner 7-Tage Ernährungsanalyse und individuellen Zielen.
                </p>
                <div className="mt-4 text-sm text-purple-600 font-medium">
                  Groq AI (LLaMA 3.1) • Deutsche Prompts
                </div>
              </div>

              {/* Feature 3: Deutsche Produktdatenbank */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Deutsche Produktdatenbank</h3>
                <p className="text-gray-600 leading-relaxed">
                  Über 2500 Produkte aus OpenFoodFacts. Alle großen Marken: Haribo, Kinder, ja!, 
                  K-Classic, Coca-Cola, Dr. Oetker und viele mehr.
                </p>
                <div className="mt-4 text-sm text-blue-600 font-medium">
                  Kontinuierlich erweitert • Automatischer Import
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bereit für eine gesündere Zukunft?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Starte heute deine Reise zu einer besseren Ernährung. 
              Kostenlos, ohne Verpflichtungen und mit sofortigen Ergebnissen.
            </p>
            <div className="flex flex-col gap-4 justify-center">
              <Button
                onClick={() => router.push('/register')}
                size="lg"
                className="bg-white text-emerald-600 active:bg-emerald-50 px-8 py-4 text-lg font-semibold shadow-xl active:scale-95"
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                size="lg"
                className="border-2 border-white text-white bg-white/10 backdrop-blur-sm active:bg-white active:text-emerald-800 px-8 py-4 text-lg active:scale-95"
              >
                Bereits registriert? Anmelden
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-center text-gray-400">
                <p>&copy; 2024 TrackFood. Alle Rechte vorbehalten.</p>
                <p className="text-sm mt-2">
                  Powered by Groq AI, OpenFoodFacts & Supabase
                </p>
              </div>
              
              {/* Trenner-Balken */}
              <div className="w-full h-px bg-gray-800 my-6"></div>
              
              {/* Klein Digital Solutions Sektion */}
              <div className="text-center pb-0">
                <p className="text-sm text-gray-500 mb-3">
                  Ein Produkt von Klein Digital Solutions
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-gray-500">
                  <a 
                    href="https://www.kleindigitalsolutions.de" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    www.kleindigitalsolutions.de
                  </a>
                  <a 
                    href="mailto:info@kleindigitalsolutions.de"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    info@kleindigitalsolutions.de
                  </a>
                  <a 
                    href="tel:+4915732984853"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    +49 157 329 848 53
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
