import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fix-scroll.css";
import { Navigation } from "@/components/BottomNavBar";
import CookieConsent from '@/components/ui/CookieConsent';
import GoogleTagManagerClient from '@/components/ui/GoogleTagManagerClient';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom on mobile for app-like feel
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
  viewportFit: "cover", // Support for iPhone notch
};

export const metadata: Metadata = {
  title: {
    default: "TrackFood - Barcode-Scanner & KI-Ernährungsberatung | 2500+ Deutsche Produkte",
    template: "%s | TrackFood"
  },
  description: "TrackFood ist die smarte Ernährungs-Tracking-App mit KI-Empfehlungen, Barcode-Scanner, 7-Tage-Analyse, Fitness-Coach, Rezeptdatenbank und 2500+ deutschen Produkten. Scanne Barcodes, analysiere deine Ernährung, erhalte individuelle Tipps und Rezepte. PWA, mobile-optimiert, Groq AI, OpenFoodFacts, Supabase. Für Abnehmen, Muskelaufbau, gesunde Ernährung und mehr.",
  keywords: [
    "Ernährungstagebuch", "Barcode Scanner Ernährung", "KI Ernährungsberatung", "Deutsche Produkte Nährwerte", "Groq AI Ernährung", "OpenFoodFacts Deutschland", "PWA Ernährungs-App", "Kalorienzähler Barcode", "EDEKA REWE ALDI Scanner", "LLaMA 3.1 Ernährung", "Mobile Barcode Scanner", "Nährstoff-Tracking KI", "Personalisierte Ernährung", "Fitness-Coach App", "Rezepte App", "Gesunde Ernährung App", "Abnehmen App", "Muskelaufbau Ernährung", "Smarte Ernährung App", "Lebensmittel Datenbank", "Zucker Tracking", "Ballaststoffe", "Natrium", "Deutsche Marken Lebensmittel", "Schnell & einfach Rezepte", "Vegane Rezepte", "PWA Deutschland", "Supabase App", "Groq AI Chatbot", "Ernährungsanalyse App", "Ernährungstracker" 
  ],
  authors: [{ name: "TrackFood Team" }],
  creator: "TrackFood",
  publisher: "TrackFood",
  metadataBase: new URL("https://trackfood.app"),
  alternates: {
    canonical: "/",
    languages: {
      'de-DE': '/de',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://trackfood-app.vercel.app",
    title: "TrackFood - Barcode-Scanner & KI-Ernährungsberatung | 2500+ Deutsche Produkte",
    description: "TrackFood: KI-Ernährungsberatung, Barcode-Scanner, 7-Tage-Analyse, Fitness-Coach, Rezepte & 2500+ deutsche Produkte. Scanne Barcodes, analysiere deine Ernährung, erhalte individuelle Tipps. PWA, mobile-optimiert, Groq AI, OpenFoodFacts, Supabase.",
    siteName: "TrackFood",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TrackFood - Barcode-Scanner mit KI-Ernährungsberatung"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackFood - Barcode-Scanner & KI-Ernährungsberatung",
    description: "TrackFood: KI-Ernährungsberatung, Barcode-Scanner, 7-Tage-Analyse, Fitness-Coach, Rezepte & 2500+ deutsche Produkte. Scanne Barcodes, analysiere deine Ernährung, erhalte individuelle Tipps. PWA, mobile-optimiert, Groq AI, OpenFoodFacts, Supabase.",
    images: ["/og-image.jpg"],
    creator: "@trackfood_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" dir="ltr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrackFood" />
        <meta name="application-name" content="TrackFood" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Favicons und Manifest: Nur die wichtigsten, keine Duplikate */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
                "Barcode-Scanner für deutsche Produkte (EAN-13, EAN-8, Code-128, Code-39)",
                "KI-gestützte Ernährungsberatung (Groq AI, LLaMA 3.1)",
                "7-Tage Ernährungsanalyse & automatische Problemerkennung",
                "Personalisierte Empfehlungen für Abnehmen, Muskelaufbau, Gesundheit",
                "Kalorien-, Makro- und Mikronährstoff-Tracking (Zucker, Ballaststoffe, Natrium)",
                "Deutsche Produktdatenbank (2500+ Produkte, EDEKA, REWE, ALDI, Lidl, Ferrero, Milka, Haribo, Coca-Cola, Dr. Oetker, uvm.)",
                "Rezepte & Inspiration, direkt ins Tagebuch übernehmen",
                "Mobile- und Safari-optimiert, PWA-fähig, offline nutzbar",
                "Supabase-Backend, sichere Authentifizierung, RLS, DSGVO-konform"
              ],
              "author": {
                "@type": "Organization",
                "name": "TrackFood Team"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} h-full bg-[#121212] text-white antialiased`}>
        <AuthProvider>
          {/* GTM nur nach Consent laden (Client-Komponente) */}
          <GoogleTagManagerClient />
          {/* Main app container with robust flex layout */}
          <div className="min-h-screen flex flex-col">
            {/* Content area that scrolls independently */}
            <main className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              {children}
            </main>
            {/* Globale Bottom Navigation Bar für eingeloggte Nutzer */}
            <Navigation />
          </div>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
