import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fix-scroll.css";
import NewBottomNav from '@/components/NewBottomNav';
import StudioBottomNav from '@/components/StudioBottomNav'; // Geändert
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
      <body className={`${inter.className} h-full bg-black text-white antialiased`}>
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
            {/* <StudioBottomNav /> */} {/* Alte Navigation, auskommentiert */}
            <NewBottomNav /> {/* Neue Navigation zum Testen */}
          </div>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
