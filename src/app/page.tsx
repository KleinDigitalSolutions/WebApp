'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import {
  QrCode,
  Brain,
  ArrowRight,
  ChevronDown,
  Target,
  Salad,
  Dumbbell
} from 'lucide-react'
import DesktopNotice from '@/components/DesktopNotice'
import GoogleLoginButton from '@/components/GoogleLoginButton'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const targetName = "TrackFood"
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [showDesktopNotice, setShowDesktopNotice] = useState(false)

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

  // Scroll-Hinweis und DesktopNotice erst nach Animation-Ende + Verzögerung anzeigen
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowScrollHint(true)
      setShowDesktopNotice(true)
    }, 1700) // 1.2s Animation + 0.5s extra
    return () => clearTimeout(timeout)
  }, [])

  if (user) {
    return null
  }
  return (
    <>
      {showDesktopNotice && <DesktopNotice />}
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-600" style={{ scrollBehavior: 'smooth' }}>
        {/* Hero Section */}
        <section className="min-h-screen bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center z-10">
            <div className="mb-8">
              <div className="relative flex justify-center items-center">
                <h1
                  className="text-6xl md:text-8xl font-bold text-white mb-4 hero-title-glow trackfood-animate flex items-center"
                  data-text={targetName}
                  style={{ perspective: '1000px' }}
                >
                  <span className="relative inline-block">
                    TrackFood
                  </span>
                </h1>
              </div>
              <div className="w-24 h-1 bg-white mx-auto rounded-full" />
            </div>
            <p className="text-xl text-emerald-100 mb-12 max-w-md mx-auto font-light">
              Intelligente Ernährung für deine Gesundheit
            </p>
          </div>

          {/* Scroll Indicator */}
          {showScrollHint && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="scroll-bounce text-white/80">
                <span className="text-sm mb-2 font-light scroll-bounce-text">Scroll für mehr</span>
                <ChevronDown className="w-6 h-6 scroll-bounce-chevron" />
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="py-10 md:py-16 bg-transparent relative z-10">
          {/* Test-Muster-Hintergrund für gesamten Features-Bereich entfernt */}
          <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 relative" style={{zIndex:1}}>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Alles was du für eine gesunde Ernährung brauchst
              </h2>
              <p className="text-xl text-white max-w-3xl mx-auto">
                Von intelligentem Barcode-Scanning bis hin zu personalisierten KI-Empfehlungen – 
                TrackFood macht gesunde Ernährung einfach und smart.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 relative" style={{zIndex:1}}>
              {/* Feature 1: KI-Ernährungsberatung */}
              <div className="relative p-6 md:p-5 lg:p-6 rounded-3xl border border-white/30 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                <div className="relative z-10">
                  <Brain className="w-14 h-14 text-white mb-6 relative z-10" />
                  <h3 className="text-xl font-semibold text-white mb-3">KI-Ernährungsberatung</h3>
                  <p className="text-emerald-50 leading-relaxed">
                    Chatte mit deinem persönlichen KI-Experten! Die KI analysiert automatisch deine letzten 7 Tage, erkennt Muster und kritische Ernährungsgewohnheiten und gibt dir sofort umsetzbare, individuelle Tipps – perfekt abgestimmt auf deine Ziele.
                  </p>
                  <div className="mt-4 text-sm text-emerald-100 font-medium">
                    Automatische Wochenanalyse • Kritische Hinweise & Empfehlungen
                  </div>
                </div>
              </div>

              {/* Feature 2: Persönlicher KI-Fitness-Coach */}
              <div className="relative p-6 md:p-5 lg:p-6 rounded-3xl border border-white/30 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                <div className="relative z-10">
                  <Dumbbell className="w-14 h-14 text-white mb-6 relative z-10" />
                  <h3 className="text-xl font-semibold text-white mb-3">Persönlicher KI-Fitness-Coach</h3>
                  <p className="text-emerald-50 leading-relaxed">
                    Deine KI erstellt individuelle Trainingspläne, gibt Tipps für mehr Bewegung und motiviert dich zu einem aktiven Lebensstil. Kombiniere Ernährung & Fitness für maximale Erfolge – egal ob Abnehmen, Muskelaufbau oder einfach gesünder leben.
                  </p>
                  <div className="mt-4 text-sm text-emerald-100 font-medium">
                    Trainingspläne • Motivation • Fortschritts-Feedback
                  </div>
                </div>
              </div>

              {/* Feature 3: Kalorien- & Ziel-Tracking */}
              <div className="relative p-6 md:p-5 lg:p-6 rounded-3xl border border-white/30 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                <div className="relative z-10">
                  <Target className="w-14 h-14 text-white mb-6 relative z-10" />
                  <h3 className="text-xl font-semibold text-white mb-3">Kalorien- & Ziel-Tracking</h3>
                  <p className="text-emerald-50 leading-relaxed">
                    Verfolge deine Kalorien, Makronährstoffe und Fortschritte – perfekt zum Abnehmen, Muskelaufbau oder Gewicht halten. Setze individuelle Ziele und erhalte smarte Auswertungen.
                  </p>
                  <div className="mt-4 text-sm text-emerald-100 font-medium">
                    Automatische Analyse • Zielorientierte Empfehlungen
                  </div>
                </div>
              </div>

              {/* Feature 4: Rezepte & Inspiration */}
              <div className="relative p-6 md:p-5 lg:p-6 rounded-3xl border border-white/30 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                <div className="relative z-10">
                  <Salad className="w-14 h-14 text-white mb-6 relative z-10" />
                  <h3 className="text-xl font-semibold text-white mb-3">Rezepte & Inspiration</h3>
                  <p className="text-emerald-50 leading-relaxed">
                    Entdecke gesunde Rezepte mit Nährwertangaben. Lass dich inspirieren und übernimm Rezepte direkt in dein Tagebuch – für mehr Abwechslung und Genuss beim Abnehmen oder Muskelaufbau.
                  </p>
                  <div className="mt-4 text-sm text-emerald-100 font-medium">
                    Gesunde Rezepte • Direkt ins Tagebuch übernehmen
                  </div>
                </div>
              </div>

              {/* Feature 5: Barcode-Scanner */}
              <div className="relative p-6 md:p-5 lg:p-6 rounded-3xl border border-white/30 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
                <div className="relative z-10">
                  <QrCode className="w-14 h-14 text-white mb-6 relative z-10" />
                  <h3 className="text-xl font-semibold text-white mb-3">Barcode-Scanner</h3>
                  <p className="text-emerald-50 leading-relaxed">
                    Scanne jeden Barcode und erhalte sofort Nährwerte! Mit deutschen Produkten in unserer Datenbank.
                  </p>
                  <div className="mt-4 text-sm text-emerald-100 font-medium">
                    Mobile & Safari optimiert • PWA-kompatibel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-transparent relative z-10">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bereit für eine gesündere Zukunft?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
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
              <div className="mt-2">
                <GoogleLoginButton />
              </div>
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
              {/* Rechtliche Links */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 mb-2 text-xs text-gray-400">
                <a href="/impressum" className="hover:text-emerald-400 underline transition-colors">Impressum</a>
                <a href="/datenschutz" className="hover:text-emerald-400 underline transition-colors">Datenschutz</a>
                <a href="/agb" className="hover:text-emerald-400 underline transition-colors">AGB</a>
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
                    href="tel:+4917641678256"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    +49 176 416 782 56
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <style jsx>{`
        @keyframes hat-drop-simple {
          0% { opacity: 0; transform: translateY(-40px) scale(0.7); }
          80% { opacity: 1; transform: translateY(4px) scale(1.1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-hat-drop-simple {
          animation: hat-drop-simple 1.1s cubic-bezier(.33,1.02,.47,.98) 0.3s both;
        }
      `}</style>
    </>
  )
}