-- =====================================================
-- TRACKFOOD COMPLETE DATABASE RESET
-- =====================================================
-- ACHTUNG: Diese Datei löscht ALLE bestehenden Tabellen und erstellt sie neu!
-- Verwenden Sie dies NUR wenn Sie die Datenbank komplett zurücksetzen wollen!
-- ALLE DATEN GEHEN VERLOREN!
-- =====================================================
--
-- Anleitung:
-- 1. Öffnen Sie Ihren Supabase SQL Editor
-- 2. Kopieren Sie den gesamten Inhalt dieser Datei
-- 3. Führen Sie das Script aus
-- 4. Alle Tabellen werden neu erstellt mit allen Beziehungen und Policies
--
-- =====================================================

-- =====================================================
-- PART 1: LÖSCHEN ALLER BESTEHENDEN TABELLEN
-- =====================================================

-- Realtime publications entfernen (Fehler werden ignoriert falls Tabellen nicht existieren)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.products;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'product_reviews') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.product_reviews;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'product_reports') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.product_reports;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'fasting_sessions') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.fasting_sessions;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'abstinence_challenges') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.abstinence_challenges;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'abstinence_logs') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.abstinence_logs;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'water_intake') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.water_intake;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Tabellen löschen (in richtiger Reihenfolge wegen Foreign Keys)
DROP TABLE IF EXISTS public.abstinence_logs CASCADE;
DROP TABLE IF EXISTS public.abstinence_challenges CASCADE;
DROP TABLE IF EXISTS public.fasting_sessions CASCADE;
DROP TABLE IF EXISTS public.product_reports CASCADE;
DROP TABLE IF EXISTS public.product_reviews CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.water_intake CASCADE;
DROP TABLE IF EXISTS public.weight_history CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.diary_entries CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Funktionen löschen
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS calculate_current_streak(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_admin_users_updated_at() CASCADE;

-- =====================================================
-- PART 2: HILFSFUNKTIONEN ERSTELLEN
-- =====================================================

-- Funktion für automatisches Profil-Erstellen bei neuen Usern
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion für automatisches updated_at Timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funktion für Streak-Berechnung
CREATE OR REPLACE FUNCTION calculate_current_streak(p_challenge_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  log_record RECORD;
BEGIN
  FOR log_record IN
    SELECT success, log_date
    FROM abstinence_logs
    WHERE challenge_id = p_challenge_id
    ORDER BY log_date DESC
  LOOP
    IF log_record.success THEN
      streak_count := streak_count + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Funktion für Admin User Update
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 3: HAUPTTABELLEN ERSTELLEN
-- =====================================================

-- ============= PROFILES TABLE =============
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Persönliche Informationen
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),

  -- Körperliche Daten
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),

  -- Ziele und Aktivität
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle')),
  diet_type TEXT,

  -- Gesundheit
  dietary_restrictions TEXT,
  health_conditions TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  show_onboarding BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles with personal information including names';
COMMENT ON COLUMN profiles.first_name IS 'User first name';
COMMENT ON COLUMN profiles.last_name IS 'User last name';

-- ============= DIARY ENTRIES TABLE =============
CREATE TABLE public.diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Essen Details
  food_name TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,

  -- Nährwerte
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carb_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_g DECIMAL(8,2) DEFAULT 0,
  sugar_g DECIMAL(8,2) DEFAULT 0,
  sodium_mg DECIMAL(8,2) DEFAULT 0,

  -- Datum
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= RECIPES TABLE =============
CREATE TABLE public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rezept Informationen
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Zutaten und Anleitung
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT NOT NULL,

  -- Zeit und Portionen
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,

  -- Nährwerte und Tags
  nutrition_info JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Sichtbarkeit
  is_public BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= WEIGHT HISTORY TABLE =============
CREATE TABLE public.weight_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= PRODUCTS TABLE =============
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT CHECK (category IN ('dairy', 'meat', 'bakery', 'frozen', 'beverages', 'fruits', 'vegetables', 'snacks', 'pantry')) NOT NULL,

  -- Preis und Verfügbarkeit
  supermarkets TEXT[] DEFAULT '{}',
  price_min DECIMAL(8,2),
  price_max DECIMAL(8,2),
  image_url TEXT,

  -- Nährwerte pro 100g
  calories_per_100g DECIMAL(8,2) NOT NULL,
  protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_per_100g DECIMAL(8,2) DEFAULT 0,
  sugar_per_100g DECIMAL(8,2) DEFAULT 0,
  salt_per_100g DECIMAL(8,2) DEFAULT 0,

  -- Zusatzinformationen
  allergens TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',

  -- Benutzer-generiert
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Verifikation und Moderation
  is_verified BOOLEAN DEFAULT FALSE,
  is_community_product BOOLEAN DEFAULT TRUE,
  verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderator_notes TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= PRODUCT REVIEWS TABLE =============
CREATE TABLE public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  is_nutrition_accurate BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ein User kann ein Produkt nur einmal bewerten
  UNIQUE(product_id, user_id)
);

-- ============= PRODUCT REPORTS TABLE =============
CREATE TABLE public.product_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT CHECK (report_type IN ('incorrect_nutrition', 'wrong_name', 'wrong_brand', 'spam', 'other')) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= WATER INTAKE TABLE =============
CREATE TABLE public.water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  daily_goal_ml INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ein User kann pro Tag nur einen Eintrag haben
  UNIQUE(user_id, date)
);

-- ============= FASTING SESSIONS TABLE =============
CREATE TABLE public.fasting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Fasten Details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_duration_hours INTEGER NOT NULL DEFAULT 16,

  -- Status
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',

  -- Fasten-Typ
  fasting_type TEXT CHECK (fasting_type IN ('intermittent_16_8', 'intermittent_18_6', 'intermittent_20_4', 'custom')) DEFAULT 'intermittent_16_8',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= ABSTINENCE CHALLENGES TABLE =============
CREATE TABLE public.abstinence_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Challenge Details
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('no_cigarettes', 'no_chips', 'no_chocolate', 'no_sugar', 'no_fastfood', 'no_coffee', 'no_alcohol')),
  challenge_name TEXT NOT NULL,

  -- Fortschritt
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reset_date TIMESTAMPTZ,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 1,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'failed')) DEFAULT 'active',

  -- Ziel und Belohnung
  target_days INTEGER DEFAULT 30,
  reward_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= ABSTINENCE LOGS TABLE =============
CREATE TABLE public.abstinence_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.abstinence_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Täglicher Log-Eintrag
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  success BOOLEAN NOT NULL,
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ein Eintrag pro Challenge pro Tag
  UNIQUE(challenge_id, log_date)
);

-- ============= ADMIN USERS TABLE =============
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'super_admin')),
  permissions JSONB DEFAULT '{"products": true, "users": false, "analytics": false}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 4: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- ============= PROFILES RLS =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============= DIARY ENTRIES RLS =============
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries"
  ON public.diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries"
  ON public.diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============= RECIPES RLS =============
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes and public recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============= WEIGHT HISTORY RLS =============
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight history"
  ON public.weight_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight history"
  ON public.weight_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight history"
  ON public.weight_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight history"
  ON public.weight_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============= PRODUCTS RLS =============
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved products and own products"
  ON public.products FOR SELECT
  USING (verification_status = 'approved' OR auth.uid() = created_by);

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = created_by);

-- ============= PRODUCT REVIEWS RLS =============
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all product reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own product reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product reviews"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============= PRODUCT REPORTS RLS =============
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product reports"
  ON public.product_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product reports"
  ON public.product_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product reports"
  ON public.product_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product reports"
  ON public.product_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============= WATER INTAKE RLS =============
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water intake"
  ON public.water_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake"
  ON public.water_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water intake"
  ON public.water_intake FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake"
  ON public.water_intake FOR DELETE
  USING (auth.uid() = user_id);

-- ============= FASTING SESSIONS RLS =============
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fasting sessions"
  ON public.fasting_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fasting sessions"
  ON public.fasting_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting sessions"
  ON public.fasting_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasting sessions"
  ON public.fasting_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============= ABSTINENCE CHALLENGES RLS =============
ALTER TABLE public.abstinence_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON public.abstinence_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON public.abstinence_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON public.abstinence_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
  ON public.abstinence_challenges FOR DELETE
  USING (auth.uid() = user_id);

-- ============= ABSTINENCE LOGS RLS =============
ALTER TABLE public.abstinence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON public.abstinence_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON public.abstinence_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.abstinence_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON public.abstinence_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============= ADMIN USERS RLS =============
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view themselves"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all"
  ON public.admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- =====================================================
-- PART 5: PERFORMANCE INDEXES
-- =====================================================

-- Profiles Indexes
CREATE INDEX idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX idx_profiles_last_name ON public.profiles(last_name);

-- Diary Entries Indexes
CREATE INDEX idx_diary_entries_user_date ON public.diary_entries(user_id, entry_date);
CREATE INDEX idx_diary_entries_meal_type ON public.diary_entries(meal_type);

-- Recipes Indexes
CREATE INDEX idx_recipes_user_public ON public.recipes(user_id, is_public);

-- Weight History Indexes
CREATE INDEX idx_weight_history_user_date ON public.weight_history(user_id, recorded_date);

-- Products Indexes
CREATE INDEX idx_products_created_by ON public.products(created_by);
CREATE INDEX idx_products_verification_status ON public.products(verification_status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_name_search ON public.products USING gin(to_tsvector('german', name || ' ' || brand));

-- Product Reviews Indexes
CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON public.product_reviews(user_id);

-- Product Reports Indexes
CREATE INDEX idx_product_reports_product ON public.product_reports(product_id);
CREATE INDEX idx_product_reports_user ON public.product_reports(user_id);
CREATE INDEX idx_product_reports_status ON public.product_reports(status);

-- Fasting Sessions Indexes
CREATE INDEX idx_fasting_sessions_user_id ON public.fasting_sessions(user_id);
CREATE INDEX idx_fasting_sessions_status ON public.fasting_sessions(status);
CREATE INDEX idx_fasting_sessions_start_time ON public.fasting_sessions(start_time);

-- Abstinence Challenges Indexes
CREATE INDEX idx_abstinence_challenges_user_id ON public.abstinence_challenges(user_id);
CREATE INDEX idx_abstinence_challenges_type ON public.abstinence_challenges(challenge_type);
CREATE INDEX idx_abstinence_challenges_status ON public.abstinence_challenges(is_active, status);

-- Abstinence Logs Indexes
CREATE INDEX idx_abstinence_logs_challenge_id ON public.abstinence_logs(challenge_id);
CREATE INDEX idx_abstinence_logs_user_date ON public.abstinence_logs(user_id, log_date);

-- =====================================================
-- PART 6: TRIGGERS
-- =====================================================

-- Trigger für automatisches Profil bei neuen Usern
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger für updated_at Timestamps
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_recipes
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_water_intake
  BEFORE UPDATE ON public.water_intake
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_fasting_sessions
  BEFORE UPDATE ON public.fasting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_abstinence_challenges
  BEFORE UPDATE ON public.abstinence_challenges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_admin_users_updated_at();

-- =====================================================
-- PART 7: REALTIME AKTIVIEREN
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_intake;

-- =====================================================
-- PART 8: SAMPLE DATA (Optional - zum Testen)
-- =====================================================

-- Beispiel-Produkte einfügen
INSERT INTO public.products (
  code, name, brand, category, calories_per_100g, protein_per_100g,
  carbs_per_100g, fat_per_100g, verification_status, is_verified,
  supermarkets, keywords
) VALUES
(
  'test_001', 'Vollmilch 3,5%', 'Weihenstephan', 'dairy',
  64, 3.4, 4.8, 3.5, 'approved', true,
  ARRAY['rewe', 'edeka', 'kaufland'], ARRAY['milch', 'frische milch', 'vollmilch']
),
(
  'test_002', 'Weißbrot', 'Golden Toast', 'bakery',
  265, 8.5, 49.0, 3.2, 'approved', true,
  ARRAY['lidl', 'aldi', 'rewe'], ARRAY['brot', 'weizen', 'toast']
),
(
  'test_003', 'Hähnchenbrust', 'Wiesenhof', 'meat',
  165, 31.0, 0.0, 3.6, 'approved', true,
  ARRAY['rewe', 'edeka'], ARRAY['hähnchen', 'geflügel', 'protein']
)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- MIGRATION ABGESCHLOSSEN!
-- =====================================================
--
-- ✅ Alle Tabellen wurden erfolgreich erstellt:
--
-- BENUTZER & PROFILE:
-- - profiles (Benutzerprofile mit Namen, Alter, Gewicht, etc.)
-- - admin_users (Admin-Verwaltung)
--
-- ERNÄHRUNG:
-- - diary_entries (Ernährungstagebuch)
-- - recipes (Rezepte)
-- - weight_history (Gewichtsverlauf)
-- - products (Produkte-Datenbank)
-- - product_reviews (Produktbewertungen)
-- - product_reports (Produkt-Meldungen)
--
-- GESUNDHEIT & CHALLENGES:
-- - water_intake (Wasserzufuhr)
-- - fasting_sessions (Fastensitzungen)
-- - abstinence_challenges (Verzichts-Challenges)
-- - abstinence_logs (Challenge-Logs)
--
-- ✅ Row Level Security aktiviert für alle Tabellen
-- ✅ Performance-Indexes erstellt
-- ✅ Trigger für automatische Timestamps
-- ✅ Realtime-Subscriptions aktiviert
-- ✅ Beispieldaten eingefügt (optional)
--
-- =====================================================
