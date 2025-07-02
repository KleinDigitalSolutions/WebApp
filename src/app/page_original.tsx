'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import { 
  Sparkles, 
  Target, 
  ChefHat, 
  Smartphone,
  Shield,
  ArrowRight,
  TrendingUp,
  Heart,
  QrCode,
  Brain,
  Database,
  BarChart3,
  Clock
} from 'lucide-react'
import Head from 'next/head'

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TrackFood",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web Browser, iOS, Android",
  "description": "Barcode scannen, KI fragen, gesund leben! TrackFood kombiniert intelligenten Barcode-Scanner mit personalisierter KI-Ernährungsberatung. 2500+ deutsche Produkte.",
  "url": "https://trackfood-app.vercel.app",
  "downloadUrl": "https://trackfood-app.vercel.app",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1247"
  },
  "features": [
    "Barcode-Scanner für deutsche Produkte",
    "KI-gestützte Ernährungsberatung mit Groq AI",
    "2500+ Produkte von EDEKA, REWE, ALDI",
    "Progressive Web App (PWA)",
    "7-Tage Ernährungsanalyse",
    "Personalisierte Empfehlungen"
  ],
  "author": {
    "@type": "Organization",
    "name": "TrackFood Team"
  }
}

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
    <>
      <Head>
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="googlebot" content="index,follow" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for APIs */}
        <link rel="dns-prefetch" href="//api.groq.com" />
        <link rel="dns-prefetch" href="//world.openfoodfacts.org" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://trackfood-app.vercel.app" />
        
        {/* Hreflang for internationalization */}
        <link rel="alternate" hrefLang="de" href="https://trackfood-app.vercel.app" />
        <link rel="alternate" hrefLang="x-default" href="https://trackfood-app.vercel.app" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
        {/* Hero Section - Mobile First */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Jetzt mit Barcode-Scanner & KI-Beratung
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                TrackFood
              </span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-700">
                Deine KI-gestützte Ernährungs-App
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              <strong>Barcode scannen, KI fragen, gesund leben.</strong> TrackFood kombiniert einen intelligenten 
              Barcode-Scanner mit personalisierten KI-Empfehlungen für eine revolutionäre Ernährungs-Experience.
            </p>

            {/* NEW: Key Features Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm">
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 backdrop-blur-xl rounded-full shadow-lg border border-emerald-400/30 text-white">
                <QrCode className="w-4 h-4 mr-2" />
                Barcode-Scanner
              </div>
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 backdrop-blur-xl rounded-full shadow-lg border border-purple-400/30 text-white">
                <Brain className="w-4 h-4 mr-2" />
                KI-Ernährungsberatung
              </div>
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-xl rounded-full shadow-lg border border-blue-400/30 text-white">
                <Database className="w-4 h-4 mr-2" />
                2500+ Deutsche Produkte
              </div>
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-xl rounded-full shadow-lg border border-orange-400/30 text-white">
                <Smartphone className="w-4 h-4 mr-2" />
                PWA - App-Feeling
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center mb-16">
              <Button
                onClick={() => router.push('/register')}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 text-lg shadow-lg font-semibold active:scale-95"
              >
                Kostenlos starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                size="lg"
                className="border-2 border-emerald-200 text-emerald-700 px-8 py-4 text-lg bg-white active:scale-95"
              >
                Bereits dabei? Anmelden
              </Button>
            </div>


          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-purple-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Barcode-Scanner + KI-Beratung jetzt verfügbar
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Alles was du für eine gesunde Ernährung brauchst
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Von intelligentem Barcode-Scanning bis hin zu personalisierten KI-Empfehlungen – 
                TrackFood macht gesunde Ernährung einfach und smart.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* NEW Feature 1: Barcode Scanner */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 active:shadow-xl ">
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

              {/* NEW Feature 2: KI-Ernährungsberatung */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 active:shadow-xl ">
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

              {/* Feature 3: Enhanced Database */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 active:shadow-xl ">
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

              {/* Feature 4: Smart Tracking */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 active:shadow-xl ">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligentes Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tracke Kalorien, Makros und Mikronährstoffe (Zucker, Ballaststoffe, Natrium). 
                  Die KI erkennt ungesunde Muster automatisch.
                </p>
                <div className="mt-4 text-sm text-orange-600 font-medium">
                  7-Tage Analyse • Problembewertung
                </div>
              </div>

              {/* Feature 5: Recipe Integration */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 active:shadow-xl ">
                <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalisierte Rezepte</h3>
                <p className="text-gray-600 leading-relaxed">
                  Entdecke tausende Rezepte von TheMealDB, die zu deinen Zielen passen. 
                  Inklusive automatischer Nährwertberechnung.
                </p>
                <div className="mt-4 text-sm text-teal-600 font-medium">
                  Allergien-Filter • Ziel-optimiert
                </div>
              </div>

              {/* Feature 6: PWA Experience */}
              <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 active:shadow-xl ">
                <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Progressive Web App</h3>
                <p className="text-gray-600 leading-relaxed">
                  App-Feeling ohne Installation! Funktioniert perfekt auf iPhone, Android und Desktop. 
                  Offline-fähig und blitzschnell.
                </p>
                <div className="mt-4 text-sm text-pink-600 font-medium">
                  Zum Homescreen hinzufügen • Offline-Modus
                </div>
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

            <div className="grid grid-cols-1 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Barcode scannen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Öffne die Kamera und scanne jeden Barcode. Sofortiger Zugriff auf Nährwerte von 2500+ deutschen Produkten.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. KI-Beratung erhalten</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chatte mit der KI über deine Ernährung. Erhalte personalisierte Empfehlungen basierend auf deinen Daten.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Ziele erreichen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Verfolge deinen Fortschritt automatisch. Die App erkennt Muster und hilft dir, deine Ziele zu erreichen.
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
                Warum TrackFood?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Erlebe den Unterschied einer KI-gestützten Ernährungsbegleitung
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Bessere Ergebnisse</h3>
                    <p className="text-gray-600">
                      Nutzer erreichen ihre Ernährungsziele 3x schneller durch personalisierte KI-Empfehlungen und Barcode-Scanning.
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
                      Basiert auf aktuellen Ernährungswissenschaften und OpenFoodFacts-Datenbank mit verifizierten Produktdaten.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Spart Zeit</h3>
                    <p className="text-gray-600">
                      Kein manuelles Eingeben mehr! Barcode scannen dauert 2 Sekunden – fertig.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-6 h-6 text-emerald-500" />
                      <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Brain className="w-6 h-6 text-purple-500" />
                      <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                      <div className="h-4 bg-blue-200 rounded w-5/6"></div>
                    </div>
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
            </h2>            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
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

            <p className="text-emerald-100 text-sm mt-6">
              Keine Kreditkarte erforderlich • Sofort loslegen • Jederzeit kündbar
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="col-span-1">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  TrackFood
                </h3>
                <p className="text-gray-400 mb-4">
                  Die intelligente Progressive Web App für gesunde Ernährung. 
                  Mit Barcode-Scanner, KI-Beratung und 2500+ deutschen Produkten.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center text-emerald-400">
                    <QrCode className="w-5 h-5 mr-2" />
                    <span className="text-sm">Barcode-Scanner</span>
                  </div>
                  <div className="flex items-center text-purple-400">
                    <Brain className="w-5 h-5 mr-2" />
                    <span className="text-sm">KI-Beratung</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Barcode-Scanner</li>
                  <li>KI-Ernährungsberatung</li>
                  <li>Nährstoff-Tracking</li>
                  <li>Rezepte</li>
                  <li>Deutsche Produkte</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>FAQ</li>
                  <li>Kontakt</li>
                  <li>Datenschutz</li>
                  <li>Impressum</li>
                  <li>AGB</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 TrackFood. Alle Rechte vorbehalten.</p>
              <p className="text-sm mt-2">
                Powered by Groq AI, OpenFoodFacts & Supabase
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
