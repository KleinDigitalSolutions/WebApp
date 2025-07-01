import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
  ],
};

export const metadata: Metadata = {
  title: {
    default: "NutriWise - Intelligente Ernährungsberatung & Nährstoff-Tracking",
    template: "%s | NutriWise"
  },
  description: "Revolutioniere deine Ernährung mit KI-gestütztem Nährstoff-Tracking. Erreiche deine Gesundheitsziele durch personalisierte Ernährungsberatung, intelligente Rezeptvorschläge und detaillierte Nährwertanalysen.",
  keywords: [
    "Ernährung",
    "Nährstoffe",
    "Gesundheit",
    "Kalorienzähler",
    "Diät",
    "Abnehmen",
    "Fitness",
    "KI Ernährungsberatung",
    "Meal Planning",
    "Gesunde Rezepte",
    "Nährwertanalyse",
    "Ernährungstagebuch"
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
    title: "NutriWise - Intelligente Ernährungsberatung & Nährstoff-Tracking",
    description: "Revolutioniere deine Ernährung mit KI-gestütztem Nährstoff-Tracking. Erreiche deine Gesundheitsziele durch personalisierte Ernährungsberatung und intelligente Rezeptvorschläge.",
    siteName: "NutriWise",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NutriWise - Intelligente Ernährungsberatung"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriWise - Intelligente Ernährungsberatung",
    description: "Revolutioniere deine Ernährung mit KI-gestütztem Nährstoff-Tracking. Erreiche deine Gesundheitsziele durch personalisierte Ernährungsberatung.",
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
    <html lang="de" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.spoonacular.com" />
        <link rel="dns-prefetch" href="https://world.openfoodfacts.org" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NutriWise" />
        <meta name="application-name" content="NutriWise" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
