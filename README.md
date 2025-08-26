# TrackFood – Intelligentes Ernährungs-Tracking & KI-Coach

TrackFood ist eine moderne, KI-gestützte Ernährungs-Tracking-Web-App mit personalisierten Empfehlungen, Barcode-Scanner, deutscher Produktdatenbank und mobile-first Design. Entwickelt mit Next.js, TypeScript, Tailwind CSS, Zustand und Supabase, um mechaniken zu testen

---

## 🚀 Features

- **Benutzer-Authentifizierung** (Supabase, Google OAuth)
- **Persönliches Profil** (BMR/TDEE, Ziele, Aktivitätslevel)
- **Ernährungstagebuch** (Makros, Mikros, OpenFoodFacts, Barcode-Import)
- **Smart Dashboard** (Makronährstoff-Analyse, Fortschritt, Ziel-Tracking)
- **🧠 KI-Ernährungsberater** (Groq AI, LLaMA 3.1, 7-Tage-Analyse, Mustererkennung, Empfehlungen)
- **Rezepte-Entdeckung** (TheMealDB, gesunde Rezepte, Integration ins Tagebuch)
- **Barcode-Scanner** (Quagga2, mobile-optimiert, PWA, deutsche Datenbank)
- **Mobile-First & PWA** (App-Feeling, offlinefähig, Safari/iOS optimiert)
- **Sichere Datenhaltung** (Supabase RLS, DSGVO-konform)

---

## 🔥 Neue KI- und Barcode-Features

- **Automatische 7-Tage-Ernährungsanalyse**
- **Intelligente Problembewertung** (z.B. Softdrinks, Fast Food, Zuckerkonsum)
- **Personalisierte Empfehlungen** (konkret, umsetzbar, zielspezifisch)
- **Erweiterte Nährstoff-Tracking** (Zucker, Ballaststoffe, Natrium)
- **Barcode-Scanner** (EAN-13, EAN-8, Code-128, Code-39, Fallback, Fehlerbehandlung)
- **Deutsche Produktdatenbank** (2500+ Produkte, große Marken, OpenFoodFacts)

---

## 🏗️ Technologie-Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Groq AI (LLaMA 3.1), OpenFoodFacts, TheMealDB
- **Barcode**: Quagga2 (mobile- und Safari-kompatibel)
- **Styling**: Tailwind CSS, mobile-first
- **PWA**: Progressive Web App

---

## 🧠 KI-Features & Chat

- **Automatische Analyse** der letzten 7 Tage (Makros, Mikros, Muster)
- **Strukturierte KI-Antworten** (Emojis, Abschnitte, Empfehlungen)
- **Quick-Action Buttons** für typische Ernährungsfragen
- **Personalisierte Beratung** (Abnehmen, Muskelaufbau, Gesundheit)

---

## 📱 Barcode-Scanner & Produktdatenbank

- **Quagga2** für zuverlässige Barcode-Erkennung (mobile, iOS/Safari)
- **Fallback & Fehlerbehandlung** bei Kamera-Problemen
- **Deutsche Produktdatenbank** (OpenFoodFacts, Bulk-Import, Markenabdeckung)
- **Automatischer Import** neuer Produkte beim Scan

---

## 🛡️ Sicherheit & Datenschutz

- **Row Level Security (RLS)** in Supabase
- **API-Keys nur serverseitig** (GROQ_API_KEY, Service Role Key)
- **Input-Validierung** und Authentifizierung
- **DSGVO-konform**

---

## 📄 Datenbank-Schema (Auszug)

- `profiles`: User-Profile (Alter, Größe, Ziel, ...)
- `diary_entries`: Ernährungstagebuch (Makros, Mikros, Barcode, Produkt)
- `products`: Produktdatenbank (Barcode, Marke, Quelle, Bild)
- `recipes`: Rezepte (eigene & öffentliche)
- `weight_history`: Gewichtstracking (zukünftig)

---

## 🛠️ Setup & Entwicklung

1. **.env.local** anlegen (Supabase, Groq API-Key)
2. **Supabase SQL** ausführen (Tabellen, RLS, Indizes)
3. **Dependencies installieren:**
   ```bash
   npm install
   npm run dev
   ```
4. **App starten:** [http://localhost:3000](http://localhost:3000)
