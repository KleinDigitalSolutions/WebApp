# TrackFood – Intelligent Nutrition Tracking (English)

This is the English summary of the TrackFood project. For the most up-to-date and detailed documentation, see the main `README.md` (German).

---

## Key Features

- **User authentication** (Supabase, Google OAuth)
- **Personal profile** (BMR/TDEE, goals, activity level)
- **Food diary** (macros, micros, OpenFoodFacts, barcode import)
- **Smart dashboard** (macro analysis, progress, goal tracking)
- **AI nutrition coach** (Groq AI, 7-day analysis, pattern recognition, recommendations)
- **Recipe discovery** (TheMealDB, healthy recipes, diary integration)
- **Barcode scanner** (Quagga2, mobile-optimized, PWA, German product database)
- **Mobile-first & PWA** (app-like, offline-ready, iOS/Safari optimized)
- **Secure data** (Supabase RLS, GDPR compliant)

---

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Groq AI (LLaMA 3.1), OpenFoodFacts, TheMealDB
- **Barcode**: Quagga2 (mobile- and Safari-compatible)
- **Styling**: Tailwind CSS, mobile-first
- **PWA**: Progressive Web App

---

## Setup (Quick Start)

1. Create `.env.local` (Supabase, Groq API key)
2. Run Supabase SQL (tables, RLS, indexes)
3. Install dependencies:
   ```bash
   npm install
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap (Selection)

- Photo tracking & AI food recognition
- Smart recipe suggestions
- Progress & motivation features (badges, score)
- Community & social (challenges, sharing, Q&A)
- Data export (PDF/CSV), Google Fit integration
- Knowledge base & tips (blog, lexicon)
- Premium features (analysis, plans, expert chat)

---

**TrackFood** – Your smart nutrition app for health, fitness & enjoyment 🥗✨
