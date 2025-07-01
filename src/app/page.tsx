'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import { 
  Sparkles, 
  Search, 
  Target, 
  ChefHat, 
  BookOpen, 
  Smartphone,
  Shield,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user) {
    return null // Prevents flash while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Hero Section - Mobile First */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Progressive Web App - überall verfügbar
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Deine{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
              mobile
            </span>
            <br />
            Ernährungs-Webapp
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            NutriWise ist eine <strong>Progressive Web App</strong>, die sich wie eine native App anfühlt. 
            Nutze sie direkt im Browser auf deinem Handy - keine Installation erforderlich!
          </p>

          {/* PWA Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm">
            <div className="flex items-center px-4 py-2 bg-emerald-500/80 backdrop-blur-xl rounded-full shadow-lg border border-emerald-400/30 text-white">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Smartphone-optimiert
            </div>
            <div className="flex items-center px-4 py-2 bg-emerald-500/80 backdrop-blur-xl rounded-full shadow-lg border border-emerald-400/30 text-white">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Blitzschnell laden
            </div>
            <div className="flex items-center px-4 py-2 bg-emerald-500/80 backdrop-blur-xl rounded-full shadow-lg border border-emerald-400/30 text-white">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Sicher & privat
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 text-lg"
            >
              Jetzt im Browser öffnen
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
              className="border-2 border-emerald-200 text-emerald-700 px-8 py-4 text-lg"
            >
              Bereits dabei? Anmelden
            </Button>
          </div>

          {/* Mobile Usage Hint */}
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-emerald-50 rounded-2xl border border-purple-100">
            <p className="text-sm text-gray-700">
              <strong>Tipp:</strong> Öffne NutriWise auf deinem Handy und füge es zum Startbildschirm hinzu 
              für ein App-ähnliches Erlebnis!
            </p>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-6 text-gray-500">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-purple-500 border-2 border-white" />
                ))}
              </div>
              <span className="ml-3 text-sm">Bereits über 1.000+ zufriedene Nutzer</span>
            </div>
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-sm">4.9/5 Bewertung</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Alles was du für eine gesunde Ernährung brauchst
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Von KI-gestützter Lebensmittelsuche bis hin zu personalisierten Rezeptvorschlägen – 
              NutriWise macht gesunde Ernährung einfach und effektiv.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">KI-Ernährungsassistent</h3>
              <p className="text-gray-600 leading-relaxed">
                Erhalte personalisierte Ernährungstipps und Antworten auf all deine Fragen von unserem intelligenten KI-Assistenten.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligente Lebensmittelsuche</h3>
              <p className="text-gray-600 leading-relaxed">
                Finde sofort Nährwertinformationen zu über 1 Million Lebensmitteln aus deutschen und internationalen Datenbanken.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatisches Kalorienzählen</h3>
              <p className="text-gray-600 leading-relaxed">
                Tracke Kalorien und Makronährstoffe automatisch. Setze Ziele und verfolge deinen Fortschritt in Echtzeit.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalisierte Rezepte</h3>
              <p className="text-gray-600 leading-relaxed">
                Entdecke tausende Rezepte, die zu deinen Zielen, Allergien und Vorlieben passen. Inklusive Nährwertanalyse.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Digitales Ernährungstagebuch</h3>
              <p className="text-gray-600 leading-relaxed">
                Dokumentiere deine Mahlzeiten, erkenne Muster und optimiere deine Ernährung basierend auf deinen Daten.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Progressive Web App</h3>
              <p className="text-gray-600 leading-relaxed">
                Nutze NutriWise als App auf deinem Smartphone oder im Browser. Offline-fähig und immer verfügbar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              So einfach funktioniert&apos;s
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              In nur 3 Schritten zu einer gesünderen Ernährung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Profil erstellen</h3>
              <p className="text-gray-600 leading-relaxed">
                Teile uns deine Ziele, Präferenzen und Allergien mit. Unsere KI erstellt ein personalisiertes Ernährungsprofil für dich.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Mahlzeiten tracken</h3>
              <p className="text-gray-600 leading-relaxed">
                Suche einfach nach Lebensmitteln oder scanne Barcodes. NutriWise berechnet automatisch alle Nährwerte für dich.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ziele erreichen</h3>
              <p className="text-gray-600 leading-relaxed">
                Verfolge deinen Fortschritt, erhalte Insights und lass dich von unserer KI zu einer gesünderen Ernährung führen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Warum NutriWise?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Erlebe den Unterschied einer KI-gestützten Ernährungsbegleitung
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Bessere Ergebnisse</h3>
                  <p className="text-gray-600">
                    Nutzer erreichen ihre Ernährungsziele 3x schneller durch personalisierte KI-Empfehlungen.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Datenschutz garantiert</h3>
                  <p className="text-gray-600">
                    Deine Gesundheitsdaten bleiben privat und sicher. DSGVO-konform und verschlüsselt.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Wissenschaftlich fundiert</h3>
                  <p className="text-gray-600">
                    Basiert auf aktuellen Ernährungswissenschaften und wird kontinuierlich von Experten weiterentwickelt.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3">
                <div className="space-y-4">
                  <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
                  <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                  <div className="h-4 bg-blue-200 rounded w-5/6"></div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="h-20 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded"></div>
                    <div className="h-16 bg-gradient-to-t from-purple-500 to-purple-300 rounded"></div>
                    <div className="h-24 bg-gradient-to-t from-blue-500 to-blue-300 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-white text-emerald-600 px-8 py-4 text-lg font-semibold"
            >
              Jetzt kostenlos registrieren
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white px-8 py-4 text-lg"
            >
              Bereits dabei? Anmelden
            </Button>
          </div>

          <p className="text-emerald-100 text-sm mt-6">
            Keine Kreditkarte erforderlich • Jederzeit kündbar • DSGVO-konform
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">NutriWise</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Die intelligente Ernährungs-App, die KI nutzt, um deine Gesundheitsziele zu erreichen. 
                Einfach, effektiv und wissenschaftlich fundiert.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produkt</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="active:text-white transition-colors">Features</a></li>
                <li><a href="#" className="active:text-white transition-colors">Preise</a></li>
                <li><a href="#" className="active:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Unternehmen</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="active:text-white transition-colors">Über uns</a></li>
                <li><a href="#" className="active:text-white transition-colors">Datenschutz</a></li>
                <li><a href="#" className="active:text-white transition-colors">Impressum</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NutriWise. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
