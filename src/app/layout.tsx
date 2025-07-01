import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileBottomNav } from "@/components/MobileBottomNav";

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
    default: "NutriWise - Barcode-Scanner & KI-Ernährungsberatung | 2500+ Deutsche Produkte",
    template: "%s | NutriWise"
  },
  description: "Barcode scannen, KI fragen, gesund leben! NutriWise kombiniert intelligenten Barcode-Scanner mit personalisierter KI-Ernährungsberatung. 2500+ deutsche Produkte (EDEKA, REWE, ALDI). PWA-App mit Groq AI.",
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
  authors: [{ name: "NutriWise Team" }],
  creator: "NutriWise",
  publisher: "NutriWise",
  metadataBase: new URL("https://nutriwise-app.vercel.app"),
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
    url: "https://nutriwise-app.vercel.app",
    title: "NutriWise - Barcode-Scanner & KI-Ernährungsberatung | 2500+ Deutsche Produkte",
    description: "Barcode scannen, KI fragen, gesund leben! Intelligenter Barcode-Scanner mit personalisierter KI-Ernährungsberatung (Groq AI). 2500+ deutsche Produkte. PWA für iOS & Android.",
    siteName: "NutriWise",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NutriWise - Barcode-Scanner mit KI-Ernährungsberatung"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriWise - Barcode-Scanner & KI-Ernährungsberatung",
    description: "Barcode scannen, KI fragen, gesund leben! 2500+ deutsche Produkte mit Groq AI-Beratung. PWA für mobile Geräte optimiert.",
    images: ["/og-image.jpg"],
    creator: "@nutriwise_app",
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
        <meta name="apple-mobile-web-app-title" content="NutriWise" />
        <meta name="application-name" content="NutriWise" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "NutriWise",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web Browser, iOS, Android",
              "description": "Barcode scannen, KI fragen, gesund leben! NutriWise kombiniert intelligenten Barcode-Scanner mit personalisierter KI-Ernährungsberatung. 2500+ deutsche Produkte.",
              "url": "https://nutriwise-app.vercel.app",
              "downloadUrl": "https://nutriwise-app.vercel.app",
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
                "name": "NutriWise Team"
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
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}
