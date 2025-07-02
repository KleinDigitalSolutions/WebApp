import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/BottomNavBar";
import CookieConsent from '@/components/ui/CookieConsent';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom on mobile for app-like feel
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" }
  ],
  viewportFit: "cover", // Support for iPhone notch
};

export const metadata: Metadata = {
  title: {
    default: "TrackFood - Barcode-Scanner & KI-Ernährungsberatung | 2500+ Deutsche Produkte",
    template: "%s | TrackFood"
  },
  description: "Barcode scannen, KI fragen, gesund leben! TrackFood kombiniert intelligenten Barcode-Scanner mit personalisierter KI-Ernährungsberatung. 2500+ deutsche Produkte (EDEKA, REWE, ALDI). PWA-App mit Groq AI.",
  keywords: [
    "Barcode Scanner Ernährung",
    "KI Ernährungsberatung",
    "Deutsche Produkte Nährwerte",
    "Groq AI Ernährung",
    "OpenFoodFacts Deutschland",
    "PWA Ernährungs-App",
    "Kalorienzähler Barcode",
    "EDEKA REWE ALDI Scanner",
    "LLaMA 3.1 Ernährung",
    "Mobile Barcode Scanner",
    "Nährstoff-Tracking KI",
    "Personalisierte Ernährung"
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
    description: "Barcode scannen, KI fragen, gesund leben! Intelligenter Barcode-Scanner mit personalisierter KI-Ernährungsberatung (Groq AI). 2500+ deutsche Produkte. PWA für iOS & Android.",
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
    description: "Barcode scannen, KI fragen, gesund leben! 2500+ deutsche Produkte mit Groq AI-Beratung. PWA für mobile Geräte optimiert.",
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
        <link rel="dns-prefetch" href="https://api.spoonacular.com" />
        <link rel="dns-prefetch" href="https://world.openfoodfacts.org" />
        <link rel="dns-prefetch" href="https://api.groq.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrackFood" />
        <meta name="application-name" content="TrackFood" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons8-organic-food-ios-17-outlined-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons8-organic-food-ios-17-outlined-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons8-organic-food-100.png" />
        <link rel="manifest" href="/manifest.json" />
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
            })
          }}
        />
      </head>
      <body className={`${inter.className} h-full bg-gradient-to-br from-emerald-50 via-white to-purple-50 antialiased`}>
        {/* Main app container with proper mobile spacing */}
        <div className="min-h-full">
          {/* Content area with bottom navigation spacing on mobile */}
          <main className="pb-20 md:pb-0">
            {children}
          </main>
        </div>
        {/* Globale Bottom Navigation Bar für eingeloggte Nutzer */}
        <Navigation />
        <CookieConsent />
      </body>
    </html>
  );
}
