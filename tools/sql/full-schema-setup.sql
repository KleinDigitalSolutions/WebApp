-- =====================================================
-- TrackFood / Fitness App - Complete Schema Setup
-- =====================================================
-- Dieses Skript setzt die wichtigsten Tabellen, Views,
-- Trigger, Indizes und RLS-Policies für das Projekt auf.
-- Einfach im Supabase SQL Editor ausführen.
--
-- HINWEIS:
-- * Das Skript löscht vorhandene Tabellen mit CASCADE.
-- * Falls du Daten behalten möchtest, entferne den DROP-Block.
-- =====================================================

-- -----------------------------------------------------
-- OPTIONAL: Bestehende Tabellen entfernen (Clean Reset)
-- -----------------------------------------------------
DO $$
BEGIN
  -- Reihenfolge wegen FK-Abhängigkeiten wichtig
  DROP TABLE IF EXISTS public.abstinence_logs CASCADE;
  DROP TABLE IF EXISTS public.abstinence_challenges CASCADE;
  DROP TABLE IF EXISTS public.user_activities CASCADE;
  DROP TABLE IF EXISTS public.fasting_sessions CASCADE;
  DROP TABLE IF EXISTS public.water_intake CASCADE;
  DROP TABLE IF EXISTS public.product_reports CASCADE;
  DROP TABLE IF EXISTS public.product_reviews CASCADE;
  DROP TABLE IF EXISTS public.products CASCADE;
  DROP TABLE IF EXISTS public.weight_history CASCADE;
  DROP TABLE IF EXISTS public.recipes CASCADE;
  DROP TABLE IF EXISTS public.diary_entries CASCADE;
  DROP TABLE IF EXISTS public.profiles CASCADE;
  DROP TABLE IF EXISTS public.admin_users CASCADE;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Skip drop step (tables existiert evtl. nicht): %', SQLERRM;
END $$;

-- -----------------------------------------------------
-- Basis-Settings & Hilfsfunktionen
-- -----------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER DATABASE postgres SET row_security = on;

-- Gemeinsame updated_at Trigger-Funktion
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------
-- PROFILES
-- -----------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Kontakt & Namen
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,

  -- Demografie
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,

  -- Körperdaten
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  is_glutenfree BOOLEAN,

  -- Ziele & Aktivität
  fitness_goals TEXT[] DEFAULT '{}'::TEXT[],
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle')),

  -- Ernährung & Gesundheit
  diet_type TEXT,
  intolerances TEXT[] DEFAULT '{}'::TEXT[],
  dietary_restrictions TEXT,
  health_conditions TEXT,

  -- Mitgliedschaft
  membership_type TEXT CHECK (membership_type IN ('basic', 'premium', 'vip')),
  membership_start_date DATE,
  membership_end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  show_onboarding BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles with personal, nutrition and onboarding data';

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- DIARY ENTRIES
-- -----------------------------------------------------
CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')) NOT NULL,
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carb_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_g DECIMAL(8,2) DEFAULT 0,
  sugar_g DECIMAL(8,2) DEFAULT 0,
  sodium_mg DECIMAL(8,2) DEFAULT 0,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- RECIPES
-- -----------------------------------------------------
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::JSONB,
  instructions TEXT NOT NULL,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  nutrition_info JSONB DEFAULT '{}'::JSONB,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_recipes
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- WEIGHT HISTORY
-- -----------------------------------------------------
CREATE TABLE public.weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- USER ACTIVITIES (NEU)
-- -----------------------------------------------------
CREATE TABLE public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER,
  calories INTEGER,
  intensity TEXT CHECK (intensity IN ('low','moderate','high')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_user_activities
  BEFORE UPDATE ON public.user_activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT CHECK (category IN ('dairy','meat','bakery','frozen','beverages','fruits','vegetables','snacks','pantry')) NOT NULL,
  supermarkets TEXT[] DEFAULT '{}'::TEXT[],
  price_min DECIMAL(8,2),
  price_max DECIMAL(8,2),
  image_url TEXT,
  calories_per_100g DECIMAL(8,2) NOT NULL,
  protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_per_100g DECIMAL(8,2) DEFAULT 0,
  sugar_per_100g DECIMAL(8,2) DEFAULT 0,
  salt_per_100g DECIMAL(8,2) DEFAULT 0,
  allergens TEXT[] DEFAULT '{}'::TEXT[],
  keywords TEXT[] DEFAULT '{}'::TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_community_product BOOLEAN DEFAULT TRUE,
  verification_status TEXT CHECK (verification_status IN ('pending','approved','rejected')) DEFAULT 'pending',
  moderator_notes TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- PRODUCT REVIEWS & REPORTS
-- -----------------------------------------------------
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review_text TEXT,
  is_nutrition_accurate BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE public.product_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('incorrect_nutrition','wrong_name','wrong_brand','spam','other')) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','resolved','dismissed')) DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- WATER INTAKE
-- -----------------------------------------------------
CREATE TABLE public.water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  daily_goal_ml INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TRIGGER set_updated_at_water_intake
  BEFORE UPDATE ON public.water_intake
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- FASTING SESSIONS
-- -----------------------------------------------------
CREATE TABLE public.fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  target_duration_hours INTEGER NOT NULL DEFAULT 16,
  status TEXT CHECK (status IN ('active','completed','cancelled')) DEFAULT 'active',
  fasting_type TEXT CHECK (fasting_type IN ('intermittent_16_8','intermittent_18_6','intermittent_20_4','custom')) DEFAULT 'intermittent_16_8',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_fasting_sessions
  BEFORE UPDATE ON public.fasting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- ABSTINENCE CHALLENGES & LOGS
-- -----------------------------------------------------
CREATE TABLE public.abstinence_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('no_cigarettes','no_chips','no_chocolate','no_sugar','no_fastfood','no_coffee','no_alcohol')),
  challenge_name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reset_date TIMESTAMPTZ,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('active','paused','completed','failed')) DEFAULT 'active',
  target_days INTEGER DEFAULT 30,
  reward_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.abstinence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.abstinence_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  success BOOLEAN NOT NULL,
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, log_date)
);

CREATE TRIGGER set_updated_at_abstinence_challenges
  BEFORE UPDATE ON public.abstinence_challenges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- ADMIN USERS
-- -----------------------------------------------------
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','moderator','super_admin')),
  permissions JSONB DEFAULT '{"products": true, "users": false, "analytics": false}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_admin_users
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------
-- ROW LEVEL SECURITY POLICIES
-- -----------------------------------------------------

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Diary entries
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Diary select" ON public.diary_entries;
DROP POLICY IF EXISTS "Diary insert" ON public.diary_entries;
DROP POLICY IF EXISTS "Diary update" ON public.diary_entries;
DROP POLICY IF EXISTS "Diary delete" ON public.diary_entries;
CREATE POLICY "Diary select"
  ON public.diary_entries FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Diary insert"
  ON public.diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Diary update"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Diary delete"
  ON public.diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recipes select" ON public.recipes;
DROP POLICY IF EXISTS "Recipes insert" ON public.recipes;
DROP POLICY IF EXISTS "Recipes update" ON public.recipes;
DROP POLICY IF EXISTS "Recipes delete" ON public.recipes;
CREATE POLICY "Recipes select"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Recipes insert"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recipes update"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Recipes delete"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Weight history
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Weight select" ON public.weight_history;
DROP POLICY IF EXISTS "Weight insert" ON public.weight_history;
DROP POLICY IF EXISTS "Weight update" ON public.weight_history;
DROP POLICY IF EXISTS "Weight delete" ON public.weight_history;
CREATE POLICY "Weight select"
  ON public.weight_history FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Weight insert"
  ON public.weight_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Weight update"
  ON public.weight_history FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Weight delete"
  ON public.weight_history FOR DELETE
  USING (auth.uid() = user_id);

-- User activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Activities select" ON public.user_activities;
DROP POLICY IF EXISTS "Activities insert" ON public.user_activities;
DROP POLICY IF EXISTS "Activities update" ON public.user_activities;
DROP POLICY IF EXISTS "Activities delete" ON public.user_activities;
CREATE POLICY "Activities select"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Activities insert"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Activities update"
  ON public.user_activities FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Activities delete"
  ON public.user_activities FOR DELETE
  USING (auth.uid() = user_id);

-- Products & related tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products select" ON public.products;
DROP POLICY IF EXISTS "Products insert" ON public.products;
DROP POLICY IF EXISTS "Products update" ON public.products;
DROP POLICY IF EXISTS "Products delete" ON public.products;
CREATE POLICY "Products select"
  ON public.products FOR SELECT
  USING (verification_status = 'approved' OR auth.uid() = created_by);
CREATE POLICY "Products insert"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Products update"
  ON public.products FOR UPDATE
  USING (auth.uid() = created_by);
CREATE POLICY "Products delete"
  ON public.products FOR DELETE
  USING (auth.uid() = created_by);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews select" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews insert" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews update" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews delete" ON public.product_reviews;
CREATE POLICY "Reviews select"
  ON public.product_reviews FOR SELECT
  USING (TRUE);
CREATE POLICY "Reviews insert"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews update"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Reviews delete"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reports select" ON public.product_reports;
DROP POLICY IF EXISTS "Reports insert" ON public.product_reports;
DROP POLICY IF EXISTS "Reports update" ON public.product_reports;
DROP POLICY IF EXISTS "Reports delete" ON public.product_reports;
CREATE POLICY "Reports select"
  ON public.product_reports FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Reports insert"
  ON public.product_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reports update"
  ON public.product_reports FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Reports delete"
  ON public.product_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Water intake
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Water select" ON public.water_intake;
DROP POLICY IF EXISTS "Water insert" ON public.water_intake;
DROP POLICY IF EXISTS "Water update" ON public.water_intake;
DROP POLICY IF EXISTS "Water delete" ON public.water_intake;
CREATE POLICY "Water select"
  ON public.water_intake FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Water insert"
  ON public.water_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Water update"
  ON public.water_intake FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Water delete"
  ON public.water_intake FOR DELETE
  USING (auth.uid() = user_id);

-- Fasting sessions
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Fasting select" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Fasting insert" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Fasting update" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Fasting delete" ON public.fasting_sessions;
CREATE POLICY "Fasting select"
  ON public.fasting_sessions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Fasting insert"
  ON public.fasting_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Fasting update"
  ON public.fasting_sessions FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Fasting delete"
  ON public.fasting_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Abstinence challenges & logs
ALTER TABLE public.abstinence_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Abstinence select" ON public.abstinence_challenges;
DROP POLICY IF EXISTS "Abstinence insert" ON public.abstinence_challenges;
DROP POLICY IF EXISTS "Abstinence update" ON public.abstinence_challenges;
DROP POLICY IF EXISTS "Abstinence delete" ON public.abstinence_challenges;
CREATE POLICY "Abstinence select"
  ON public.abstinence_challenges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Abstinence insert"
  ON public.abstinence_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Abstinence update"
  ON public.abstinence_challenges FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Abstinence delete"
  ON public.abstinence_challenges FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE public.abstinence_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Abstinence logs select" ON public.abstinence_logs;
DROP POLICY IF EXISTS "Abstinence logs insert" ON public.abstinence_logs;
DROP POLICY IF EXISTS "Abstinence logs update" ON public.abstinence_logs;
DROP POLICY IF EXISTS "Abstinence logs delete" ON public.abstinence_logs;
CREATE POLICY "Abstinence logs select"
  ON public.abstinence_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Abstinence logs insert"
  ON public.abstinence_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Abstinence logs update"
  ON public.abstinence_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Abstinence logs delete"
  ON public.abstinence_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Admin users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins select" ON public.admin_users;
DROP POLICY IF EXISTS "Admins insert" ON public.admin_users;
DROP POLICY IF EXISTS "Admins update" ON public.admin_users;
DROP POLICY IF EXISTS "Admins delete" ON public.admin_users;
CREATE POLICY "Admins select"
  ON public.admin_users FOR SELECT
  USING (auth.role() = 'service_role');
CREATE POLICY "Admins insert"
  ON public.admin_users FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins update"
  ON public.admin_users FOR UPDATE
  USING (auth.role() = 'service_role');
CREATE POLICY "Admins delete"
  ON public.admin_users FOR DELETE
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------
-- INDEXE
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed, onboarding_step);
CREATE INDEX IF NOT EXISTS idx_profiles_activity ON public.profiles(activity_level);

CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON public.diary_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON public.weight_history(user_id, recorded_date);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON public.user_activities(user_id, activity_date);

CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_verification ON public.products(verification_status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_search
  ON public.products USING GIN (to_tsvector('german', coalesce(name,'') || ' ' || coalesce(brand,'')));

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_product ON public.product_reports(product_id);

CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON public.water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_active ON public.fasting_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_status ON public.fasting_sessions(status);
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_user ON public.abstinence_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_abstinence_logs_user_date ON public.abstinence_logs(user_id, log_date);

-- -----------------------------------------------------
-- REALTIME-PUBLICATION
-- -----------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'product_reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'product_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reports;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'water_intake'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.water_intake;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'fasting_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'abstinence_challenges'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_challenges;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'abstinence_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_logs;
  END IF;
END $$;

-- =====================================================
-- FERTIG!
-- =====================================================
-- Nach Ausführung:
-- * Alle Tabellen existieren mit den erwarteten Spalten.
-- * RLS/Policies sind gesetzt, sodass Client-Aufrufe funktionieren.
-- * Realtime und Indizes sind aktiv.
-- -----------------------------------------------------
