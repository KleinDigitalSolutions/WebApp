# NutriWise - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
NutriWise ist eine intelligente Ernährungs-Tracking-Web-App mit **personalisierten KI-Empfehlungen**, gebaut mit Next.js App Router, TypeScript, Tailwind CSS, Zustand for State Management, und Supabase als Backend-as-a-Service.

## 🔥 **NEUE KI-FEATURES (implementiert)**
- **📊 7-Tage Ernährungsanalyse:** Automatische Auswertung der Tagebuchdaten
- **🧠 Intelligente Problembewertung:** Erkennt ungesunde Muster (z.B. zu viel Cola)
- **💡 Personalisierte Empfehlungen:** Konkrete, umsetzbare Verbesserungsvorschläge
- **📈 Erweiterte Nährstoff-Tracking:** Zucker, Ballaststoffe, Natrium
- **🎯 Zielspezifische Beratung:** Angepasst an Abnehmen, Zunehmen, Muskelaufbau

## Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: **Groq AI (LLaMA 3.1)**, OpenFoodFacts, TheMealDB
- **Styling**: Tailwind CSS with mobile-first approach
- **PWA**: Progressive Web App capabilities

## Architecture Principles
- Mobile-first design with "app-like" feel
- Server-side rendering (SSR) for dynamic content
- Static generation (SSG) for static content
- Incremental Static Regeneration (ISR) for semi-static content
- Row Level Security (RLS) in Supabase for data protection
- **KI-gestützte personalisierte Ernährungsberatung**

## Code Standards
- Use TypeScript for all code
- Implement proper error handling
- Follow Next.js App Router patterns
- Use Tailwind CSS utility classes
- Implement responsive design with Tailwind breakpoints
- Add loading states and smooth animations
- Ensure API keys are properly secured server-side
- **Deutsche Sprache für KI-Antworten und UI**

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

### Database Schema Extensions
```sql
-- Erweiterte Nährstoff-Spalten in diary_entries:
ALTER TABLE diary_entries ADD COLUMN sugar_g NUMERIC DEFAULT 0;
ALTER TABLE diary_entries ADD COLUMN fiber_g NUMERIC DEFAULT 0; 
ALTER TABLE diary_entries ADD COLUMN sodium_mg NUMERIC DEFAULT 0;
```

## 💻 Development Guidelines

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

## Database Schema
- `profiles`: User profile data extending auth.users
- `diary_entries`: **Erweiterte** Daily nutrition entries (mit sugar_g, fiber_g, sodium_mg)
- `recipes`: User recipes and saved recipes
- `weight_history`: Weight tracking (future phase)
- `knowledge_articles`: Blog content (future phase)

## Security Guidelines
- Always use RLS policies in Supabase
- Keep API keys server-side only (besonders GROQ_API_KEY)
- Validate all user inputs
- Implement proper authentication flows
- **Service Role Key** für Chat-API Zugriff auf Tagebuchdaten
