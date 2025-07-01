# NutriWise - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
NutriWise ist eine intelligente Ernährungs-Tracking-Web-App mit **personalisierten KI-Empfehlungen** und **vollständigem Barcode-Scanner**, gebaut mit Next.js App Router, TypeScript, Tailwind CSS, Zustand for State Management, und Supabase als Backend-as-a-Service.

## 🔥 **NEUE FEATURES (implementiert)**
- **📊 7-Tage Ernährungsanalyse:** Automatische Auswertung der Tagebuchdaten
- **🧠 Intelligente Problembewertung:** Erkennt ungesunde Muster (z.B. zu viel Cola)
- **💡 Personalisierte Empfehlungen:** Konkrete, umsetzbare Verbesserungsvorschläge
- **📈 Erweiterte Nährstoff-Tracking:** Zucker, Ballaststoffe, Natrium
- **🎯 Zielspezifische Beratung:** Angepasst an Abnehmen, Zunehmen, Muskelaufbau
- **📱 Barcode-Scanner:** Vollständig integriert mit Quagga2, mobile- und Safari/iOS-optimiert
- **🏪 Deutsche Produktdatenbank:** 2500+ Produkte aus OpenFoodFacts, alle großen Marken

## Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: **Groq AI (LLaMA 3.1)**, OpenFoodFacts, TheMealDB
- **Barcode**: Quagga2 (mobile- und Safari-kompatibel)
- **Styling**: Tailwind CSS with mobile-first approach
- **PWA**: Progressive Web App capabilities

## 📱 Barcode-Scanner Implementation

### Core Components
- **`/src/components/BarcodeScanner.tsx`**: Hauptkomponente mit Quagga2-Integration
- **`/src/app/api/food/barcode/route.ts`**: API-Route für Barcode-Lookup
- **`/src/lib/openfoodfacts-api.ts`**: OpenFoodFacts-API-Wrapper
- **`/src/lib/german-product-database.ts`**: Lokale Produktdatenbank-Utils

### Scanner Features
```typescript
// Mobile- und Safari/iOS-optimiert
// Automatisches Fallback für Kamera-Probleme
// Benutzerfreundliche Fehlerbehandlung
// PWA-kompatibel (getUserMedia)
// Unterstützt EAN-13, EAN-8, Code-128, Code-39
```

### Barcode Lookup Strategy
1. **Lokale Supabase-Datenbank** (schnellstes Ergebnis)
2. **OpenFoodFacts-API** (falls nicht lokal vorhanden)
3. **Automatischer Import** neuer Produkte in lokale DB

### Database Schema (Barcode Support)
```sql
-- Erweiterte products-Tabelle:
ALTER TABLE products ADD COLUMN barcode VARCHAR(20);
ALTER TABLE products ADD COLUMN brand VARCHAR(100);
ALTER TABLE products ADD COLUMN image_url TEXT;
ALTER TABLE products ADD COLUMN source VARCHAR(20) DEFAULT 'manual';
CREATE INDEX idx_products_barcode ON products(barcode);

-- Erweiterte Nährstoff-Spalten in diary_entries:
ALTER TABLE diary_entries ADD COLUMN sugar_g NUMERIC DEFAULT 0;
ALTER TABLE diary_entries ADD COLUMN fiber_g NUMERIC DEFAULT 0; 
ALTER TABLE diary_entries ADD COLUMN sodium_mg NUMERIC DEFAULT 0;
```

## 🏪 Deutsche Produktdatenbank

### Import-Strategie
- **Bulk-Import**: 800+ Basis-Produkte aus OpenFoodFacts
- **Enhanced Import**: Gezielte Marken-Importe mit Duplikat-Prüfung
- **Automatischer Import**: Neue Produkte beim ersten Barcode-Scan

### Abgedeckte Marken (2500+ Produkte)
```typescript
const majorGermanBrands = [
  'Ferrero', 'Milka', 'Haribo', 'Ritter Sport', 'Kinder',
  'ja!', 'EDEKA', 'REWE', 'ALDI', 'Lidl', 'K-Classic',
  'Coca-Cola', 'Nutella', 'Yogurette', 'Hanuta', 'Duplo',
  'Dr. Oetker', 'Knorr', 'Maggi', 'Barilla', 'Müller',
  // ... und viele weitere
];
```

### Import-Tools
- **`/src/lib/openfoodfacts-bulk-importer.ts`**: Basis-Import
- **`/src/lib/enhanced-openfoodfacts-importer.ts`**: Marken-spezifischer Import
- **`/test-enhanced-import.js`**: Test-Script für neue Importe
- **`/analyze-brands.js`**: Marken-Analyse für Lücken-Identifikation

## 🧠 KI-Chat Implementation Details

### API Structure (`/src/app/api/chat/route.ts`)
```typescript
// Lädt 7-Tage Tagebuchdaten aus Supabase
// Analysiert Nährstoffe: Kalorien, Protein, Kohlenhydrate, Fett, Zucker, Ballaststoffe, Natrium
// Erkennt Muster: häufige Lebensmittel, ungesunde Gewohnheiten
// Übergibt strukturierten Kontext an Groq AI
```

### Groq AI Integration (`/src/lib/groq-api.ts`)
```typescript
// Model: 'llama-3.1-8b-instant'
// Spezialisierter Ernährungsexperten-Prompt
// Strukturierte Antworten mit Emojis
// Personalisierte Empfehlungen basierend auf Tagebuchdaten
```

### Chat Frontend (`/src/app/chat/page.tsx`)
```typescript
// User-ID wird an Chat-API übertragen
// Quick-Action Buttons für typische Fragen
// Welcome-Message mit Feature-Erklärung
// Responsive Design mit Tailwind
```

## 💻 Development Guidelines

### Barcode-Scanner Entwicklung
- **Quagga2 verwenden** für zuverlässige Barcode-Erkennung
- **Mobile-first Optimierung** (besonders iOS/Safari)
- **Fehlerbehandlung** für Kamera-Zugriff implementieren
- **PWA-Kompatibilität** sicherstellen
- **Deutsche Produktdatenbank** kontinuierlich erweitern

### Produktdatenbank-Management
- **OpenFoodFacts-API** als primäre Quelle nutzen
- **Duplikat-Prüfung** bei Importen durchführen
- **Marken-spezifische Importe** für bessere Abdeckung
- **Automatischer Import** bei neuen Barcode-Scans
- **Test-Scripts** für Validierung verwenden

### KI-Chat Entwicklung
- **Groq API verwenden** statt Grok AI (LLaMA 3.1 Model)
- **Deutsche Prompts** für bessere Antworten
- **Strukturierte Datenanalyse** der letzten 7 Tage
- **Automatische Problembewertung** implementieren
- **Quick-Actions** für häufige Fragen bereitstellen

### Ernährungsdaten-Analyse
- **Makronährstoffe bewerten:** Protein 15-25%, Kohlenhydrate 45-65%, Fett 20-35%
- **Mikronährstoffe tracken:** Ballaststoffe (25-30g/Tag), Zucker, Natrium
- **Muster erkennen:** Cola/Softdrinks, Fast Food, Süßwaren
- **Personalisierte Empfehlungen:** Basierend auf Nutzerzielen

### UI/UX Best Practices  
- **Mobile-first Design** mit Tailwind CSS
- **Emojis und Struktur** in KI-Antworten
- **Quick-Action Buttons** für sofortige Analyse
- **Loading States** für KI-Antworten
- **Responsive Chat-Interface**
- **Kompakte Tagebuch-Darstellung** mit neuen Icons

## Architecture Principles
- Mobile-first design with "app-like" feel
- Server-side rendering (SSR) for dynamic content
- Static generation (SSG) for static content
- Incremental Static Regeneration (ISR) for semi-static content
- Row Level Security (RLS) in Supabase for data protection
- **KI-gestützte personalisierte Ernährungsberatung**
- **Offline-fähiger Barcode-Scanner** (PWA)

## Code Standards
- Use TypeScript for all code
- Implement proper error handling
- Follow Next.js App Router patterns
- Use Tailwind CSS utility classes
- Implement responsive design with Tailwind breakpoints
- Add loading states and smooth animations
- Ensure API keys are properly secured server-side
- **Deutsche Sprache für KI-Antworten und UI**
- **Mobile-optimierte Barcode-Scanner**

## Database Schema
- `profiles`: User profile data extending auth.users
- `diary_entries`: **Erweiterte** Daily nutrition entries (mit sugar_g, fiber_g, sodium_mg)
- `products`: **Erweiterte** Product database (mit barcode, brand, image_url, source)
- `recipes`: User recipes and saved recipes
- `weight_history`: Weight tracking (future phase)
- `knowledge_articles`: Blog content (future phase)

## Security Guidelines
- Always use RLS policies in Supabase
- Keep API keys server-side only (besonders GROQ_API_KEY)
- Validate all user inputs
- Implement proper authentication flows
- **Service Role Key** für Chat-API Zugriff auf Tagebuchdaten
- **OpenFoodFacts-API** öffentlich, keine Keys erforderlich

## 🚀 Future Enhancements

### Produktdatenbank-Erweiterung
- **Kontinuierliche Marken-Ergänzung** basierend auf User-Feedback
- **Regionale Produkte** (Bio-Läden, lokale Marken)
- **Nährwert-Verbesserungen** (vollständigere Mikronährstoffe)

### Barcode-Scanner Optimierung
- **Scan-Geschwindigkeit** weiter verbessern
- **Offline-Modus** für häufig gescannte Produkte
- **Batch-Scanning** für Einkaufslisten

### Dokumentation
- **Import-Logs** für nachvollziehbare Datenbank-Änderungen
- **API-Performance-Monitoring** für OpenFoodFacts-Aufrufe
- **User-Analytics** für Scanner-Nutzung und beliebte Produkte
