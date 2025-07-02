# TrackFood - Intelligent Nutrition Tracking

A comprehensive, AI-powered nutrition tracking web application built with Next.js, TypeScript, Tailwind CSS, Zustand, and Supabase.

## 🚀 Features (Phase 1 - MVP)

### ✅ Implemented
- **User Authentication** - Secure signup/login with Supabase Auth + Google OAuth
- **Personal Profile Management** - BMR/TDEE calculations using Mifflin-St Jeor equation
- **Food Diary** - Track daily nutrition with OpenFoodFacts API integration
- **Smart Dashboard** - Visual progress tracking with macro breakdown
- **AI Nutrition Coach** - Chat interface powered by Grok AI
- **Recipe Discovery** - Search recipes with dietary filters via Spoonacular API
- **Mobile-First Design** - Responsive, app-like experience
- **PWA Ready** - Basic Progressive Web App capabilities

### 🏗️ Architecture
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand for client-side state
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **APIs**: Grok AI, OpenFoodFacts, Spoonacular
- **Styling**: Tailwind CSS with mobile-first approach

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

# API Keys (Server-side only)
GROK_API_KEY=your_grok_api_key
SPOONACULAR_API_KEY=your_spoonacular_api_key

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

### Grok AI
1. Get API access at [x.ai](https://x.ai)
2. Generate API key from your dashboard

### Spoonacular
1. Sign up at [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Get your API key (free tier: 150 requests/day)

### OpenFoodFacts
- No API key required - free public API

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

## 🎯 Usage Guide

### First Time Setup
1. **Register/Login** - Create account or sign in
2. **Complete Profile** - Add age, height, weight, activity level, and goal
3. **Start Tracking** - Log your first meal in the diary
4. **Explore Features** - Try the AI coach and recipe discovery

### Daily Workflow
1. **Check Dashboard** - View progress and daily targets
2. **Log Meals** - Search and add foods to diary
3. **Ask AI Coach** - Get personalized nutrition advice
4. **Discover Recipes** - Find meals that match your goals

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
