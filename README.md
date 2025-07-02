# TrackFood - Intelligent Nutrition Tracking

Eine umfassende, KI-gestützte Ernährungs-Tracking-Web-App mit personalisierten Empfehlungen, gebaut mit Next.js, TypeScript, Tailwind CSS, Zustand und Supabase.

## 🚀 Features (Phase 1 - MVP)

### ✅ Vollständig Implementiert
- **Benutzer-Authentifizierung** - Sichere Anmeldung mit Supabase Auth + Google OAuth
- **Persönliches Profil** - BMR/TDEE-Berechnungen mit Mifflin-St Jeor-Gleichung
- **Ernährungstagebuch** - Tägliche Nährstoff-Verfolgung mit OpenFoodFacts API
- **Smart Dashboard** - Visueller Fortschritt mit Makronährstoff-Aufschlüsselung
- **🧠 KI-Ernährungsberater** - **NEUE FUNKTION:** Personalisierte Analyse der letzten 7 Tage
- **Rezepte-Entdeckung** - Rezeptsuche mit TheMealDB (kostenlos) + Übersetzungsunterstützung
- **Mobile-First Design** - Responsive, app-ähnliche Erfahrung
- **PWA Ready** - Progressive Web App Funktionen

### 🔥 **NEUE KI-FUNKTIONEN**
- **📊 Detaillierte Ernährungsanalyse:** Automatische Auswertung der letzten 7 Tage
- **⚠️ Intelligente Problembewertung:** Erkennt automatisch ungesunde Muster (z.B. "Du trinkst zu viel Cola")
- **💡 Personalisierte Empfehlungen:** Konkrete, umsetzbare Verbesserungsvorschläge
- **📈 Nährstoff-Tracking:** Protein, Kohlenhydrate, Fett, Zucker, Ballaststoffe, Natrium
- **🎯 Zielspezifische Beratung:** Angepasst an Abnehmen, Zunehmen, Muskelaufbau
- **🍎 Quick-Actions:** Vorgefertigte Analyse-Fragen für sofortige Insights

### 🏗️ Technologie-Stack
- **Frontend**: Next.js 14 mit App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand für Client-seitige Zustandsverwaltung
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **APIs**: Groq AI (LLaMA 3.1), OpenFoodFacts, TheMealDB
- **Styling**: Tailwind CSS mit Mobile-First-Ansatz
- **KI-Features**: Personalisierte Ernährungsanalyse mit 7-Tage-Tracking

## 🧠 KI-Ernährungsberater Features

### 📊 **Intelligente Datenanalyse**
- **Makronährstoff-Bewertung:** Automatische Berechnung von Protein-, Kohlenhydrat- und Fettverteilung
- **Mikronährstoff-Tracking:** Zucker, Ballaststoffe, Natrium-Überwachung
- **Durchschnittswerte:** Tägliche Kalorienzufuhr und Nährstoffaufnahme über 7 Tage
- **Nährstoffverhältnisse:** Prozentuale Verteilung der Makronährstoffe

### 🔍 **Automatische Mustererkennung**
```
✅ Erkennt automatisch:
• Cola, Softdrinks, Limonaden → "Du trinkst zu viel zuckerhaltige Getränke"
• Fast Food, Burger, Pommes → "Zu viel verarbeitete Lebensmittel"
• Süßigkeiten, Schokolade → "Hoher Zuckerkonsum erkannt"
• Unregelmäßige Mahlzeiten → "Essrhythmus optimieren"
• Fehlende Lebensmittelgruppen → "Mehr Gemüse/Vollkorn empfohlen"
```

### 💬 **Persönliche Beratung**
- **Strukturierte Antworten** mit Emojis und klaren Abschnitten
- **Konkrete Empfehlungen:** "Ersetze Cola durch Wasser mit Zitrone"
- **Wissenschaftlich fundiert:** Basiert auf Ernährungswissenschaft
- **Zielspezifisch:** Angepasst an Abnehmen, Zunehmen, Muskelaufbau
- **Motivierend:** Positive Verstärkung und Ermutigung

### 🎯 **Quick-Action Buttons**
```
📊 "Analysiere meine Ernährung der letzten 7 Tage detailliert"
⚠️ "Was esse ich zu viel und was sollte ich reduzieren?"
💪 "Bekomme ich genug Protein und alle wichtigen Nährstoffe?"
🍬 "Wie viel Zucker und verarbeitete Lebensmittel esse ich?"
🥗 "Welche gesunden Alternativen passen zu meinen Gewohnheiten?"
📋 "Erstelle mir einen Wochenplan basierend auf meiner Analyse"
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- API Keys for: Grok AI, Spoonacular (OpenFoodFacts is free)

### 1. Environment Configuration
Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Keys (Server-side only)
GROQ_API_KEY=your_groq_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create diary_entries table
CREATE TABLE diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  calories NUMERIC NOT NULL,
  protein_g NUMERIC NOT NULL,
  carb_g NUMERIC NOT NULL,
  fat_g NUMERIC NOT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recipes table (for future use)
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT,
  ingredients JSONB,
  instructions TEXT,
  nutrition_info JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for diary_entries
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public recipes or own recipes" ON recipes
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, entry_date);
CREATE INDEX idx_diary_entries_meal_type ON diary_entries(meal_type);
CREATE INDEX idx_diary_entries_created_at ON diary_entries(created_at);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = TRUE;
```

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔑 API Keys Setup

### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your Project URL and Anon Key from Settings > API
3. Enable Google OAuth in Authentication > Providers (optional)

### 4. KI-API Setup

#### Groq AI (für KI-Ernährungsberater)
1. Kostenloses Konto erstellen auf [console.groq.com](https://console.groq.com)
2. API-Key generieren
3. Model: `llama-3.1-8b-instant` (schnell und kostenlos)

#### OpenFoodFacts
- Keine API-Key erforderlich - kostenlose öffentliche API
- Deutsche Produktdatenbank verfügbar

#### TheMealDB  
- Keine API-Key erforderlich - kostenlose Rezept-API
- Rezepte werden automatisch ins Deutsche übersetzt

## 📱 App Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── chat/              # AI chat interface
│   ├── diary/             # Food diary
│   ├── profile/           # User profile
│   └── recipes/           # Recipe discovery
├── components/            # Reusable UI components
├── lib/                   # Utilities & API clients
└── store/                 # Zustand state management
```

## 🎯 Benutzer-Anleitung

### Erste Schritte
1. **Registrierung/Anmeldung** - Konto erstellen oder anmelden
2. **Profil vervollständigen** - Alter, Größe, Gewicht, Aktivitätslevel und Ziel eingeben
3. **Erste Mahlzeit loggen** - Erstes Essen im Tagebuch erfassen
4. **KI-Berater testen** - Ernährungsanalyse anfordern

### Täglicher Workflow
1. **Dashboard prüfen** - Fortschritt und Tagesziele anzeigen
2. **Mahlzeiten loggen** - Lebensmittel suchen und zum Tagebuch hinzufügen
3. **🧠 KI-Berater nutzen** - Personalisierte Ernährungsanalyse anfordern
4. **Rezepte entdecken** - Passende Mahlzeiten für Ihre Ziele finden

### 🔥 **NEUE KI-Features nutzen**

#### Sofortige Ernährungsanalyse
```
💬 Fragen Sie den KI-Berater:
• "Analysiere meine Ernährung der letzten 7 Tage"
• "Was esse ich zu viel?"
• "Bekomme ich genug Protein?"
• "Wie kann ich abnehmen?"
```

#### Beispiel KI-Antwort
```
📊 ERNÄHRUNGSANALYSE (letzte 7 Tage):
- Gesamtkalorien: 14.500 kcal (⌀ 2.071 kcal/Tag)
- Protein: 15% (zu niedrig für Muskelaufbau)
- Zucker: 45g/Tag (zu hoch)

⚠️ AUFFÄLLIGKEITEN:
- Du trinkst häufig Cola (5x diese Woche)
- Zu wenig Gemüse und Ballaststoffe

✅ EMPFEHLUNGEN:
1. Ersetze Cola durch Wasser mit Zitrone
2. Füge täglich 2 Portionen Gemüse hinzu
3. Erhöhe Protein auf 1,6g/kg Körpergewicht
```

## 🔮 Roadmap

### Phase 2 - Enhanced Features
- [ ] Barcode scanning for food products
- [ ] Advanced nutrition analytics
- [ ] Meal planning and shopping lists
- [ ] Progress charts and reports

### Phase 3 - Community & Content
- [ ] Weight tracking with history
- [ ] Knowledge base/blog
- [ ] Recipe saving and favorites
- [ ] Social features and challenges

### Phase 4 - Advanced AI & PWA
- [ ] Advanced PWA with offline mode
- [ ] Push notifications
- [ ] AI meal planner
- [ ] Computer vision for food logging

## 🛡️ Security

- **Row Level Security (RLS)** enforced in Supabase
- **API keys protected** server-side only
- **Input validation** on all user data
- **HTTPS only** in production

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For support, please open an issue on GitHub or contact [support@trackfood.app](mailto:support@trackfood.app)

---

**TrackFood** - Your intelligent nutrition companion 🥗✨
