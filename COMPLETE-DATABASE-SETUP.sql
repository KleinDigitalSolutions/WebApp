-- =============================================
-- A.N.D LETICS FITNESS STUDIO APP
-- COMPLETE DATABASE SETUP
-- =============================================
-- Run this ENTIRE file in your Supabase SQL Editor
-- This creates ALL tables needed for the app
-- =============================================

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- =============================================
-- PART 1: CORE FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 2: PROFILES TABLE (User Profiles)
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Basic Info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,

  -- Physical Measurements
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),

  -- Fitness Goals & Activity
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle')),
  fitness_goals TEXT[],

  -- Diet & Health
  diet_type TEXT,
  dietary_restrictions TEXT,
  health_conditions TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Trigger & Function for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =============================================
-- PART 3: PRODUCTS TABLE (Barcode/Food Scanning)
-- =============================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT CHECK (category IN ('dairy', 'meat', 'bakery', 'frozen', 'beverages', 'fruits', 'vegetables', 'snacks', 'pantry')) NOT NULL,

  -- Store & Location
  supermarkets TEXT[] DEFAULT '{}',
  stores TEXT[] DEFAULT '{}',
  country TEXT DEFAULT 'germany',

  -- Pricing
  price_min DECIMAL(8,2),
  price_max DECIMAL(8,2),
  image_url TEXT,

  -- Nutrition per 100g
  calories_per_100g DECIMAL(8,2) NOT NULL,
  protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_per_100g DECIMAL(8,2) DEFAULT 0,
  sugar_per_100g DECIMAL(8,2) DEFAULT 0,
  salt_per_100g DECIMAL(8,2) DEFAULT 0,
  sodium_mg DECIMAL(8,2) DEFAULT 0,

  -- Metadata
  allergens TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',

  -- User & Verification
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_community_product BOOLEAN DEFAULT TRUE,
  verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderator_notes TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view approved products and own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

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

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_verification_status ON public.products(verification_status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('german', name));
CREATE INDEX IF NOT EXISTS idx_products_brand_search ON public.products USING gin(to_tsvector('german', brand));

-- =============================================
-- PART 4: PRODUCT REVIEWS & REPORTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  is_nutrition_accurate BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.product_reports (
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

-- RLS for product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all product reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own product reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own product reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own product reviews" ON public.product_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS for product_reports
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product reports" ON public.product_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own product reports" ON public.product_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own product reports" ON public.product_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own product reports" ON public.product_reports FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PART 5: DIARY ENTRIES (Food Logging)
-- =============================================

CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,

  -- Nutrition
  calories DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carb_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fiber_g DECIMAL(8,2) DEFAULT 0,
  sugar_g DECIMAL(8,2) DEFAULT 0,
  sodium_mg DECIMAL(8,2) DEFAULT 0,

  -- Reference to scanned product
  product_code TEXT,

  -- Date & Time
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for diary_entries
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries" ON public.diary_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diary entries" ON public.diary_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diary entries" ON public.diary_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary entries" ON public.diary_entries FOR DELETE USING (auth.uid() = user_id);

-- Indexes for diary_entries
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON public.diary_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_meal_type ON public.diary_entries(meal_type);
CREATE INDEX IF NOT EXISTS idx_diary_entries_product_code ON public.diary_entries(product_code);

-- =============================================
-- PART 6: RECIPES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT UNIQUE,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  nutrition_info JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  source TEXT DEFAULT 'user',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for recipes
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

CREATE TRIGGER set_updated_at_recipes
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for recipes
CREATE INDEX IF NOT EXISTS idx_recipes_user_public ON public.recipes(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);

-- =============================================
-- PART 7: WEIGHT HISTORY
-- =============================================

CREATE TABLE IF NOT EXISTS public.weight_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for weight_history
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight history" ON public.weight_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight history" ON public.weight_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight history" ON public.weight_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight history" ON public.weight_history FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON public.weight_history(user_id, recorded_date);

-- =============================================
-- PART 8: WATER INTAKE
-- =============================================

CREATE TABLE IF NOT EXISTS public.water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  daily_goal_ml INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS for water_intake
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water intake" ON public.water_intake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water intake" ON public.water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water intake" ON public.water_intake FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own water intake" ON public.water_intake FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_water_intake
  BEFORE UPDATE ON public.water_intake
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON public.water_intake(user_id, date);

-- =============================================
-- PART 9: USER ACTIVITIES (Exercise Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id TEXT,
  activity_name TEXT NOT NULL,
  emoji TEXT,
  met DECIMAL(5,2),
  duration_min INTEGER NOT NULL,
  weight_kg DECIMAL(5,2),
  calories INTEGER NOT NULL,
  note TEXT,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON public.user_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON public.user_activities FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_user_activities
  BEFORE UPDATE ON public.user_activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_date ON public.user_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON public.user_activities(user_id, activity_date);

-- =============================================
-- PART 10: FASTING SESSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.fasting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_duration_hours INTEGER NOT NULL DEFAULT 16,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  fasting_type TEXT CHECK (fasting_type IN ('intermittent_16_8', 'intermittent_18_6', 'intermittent_20_4', 'custom')) DEFAULT 'intermittent_16_8',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- RLS for fasting_sessions
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can insert own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can update own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can delete own fasting sessions" ON public.fasting_sessions;

CREATE POLICY "Users can view own fasting sessions" ON public.fasting_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fasting sessions" ON public.fasting_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fasting sessions" ON public.fasting_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fasting sessions" ON public.fasting_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_fasting_sessions
  BEFORE UPDATE ON public.fasting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_id ON public.fasting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_status ON public.fasting_sessions(status);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_start_time ON public.fasting_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_active ON public.fasting_sessions(user_id, is_active);

-- =============================================
-- PART 11: ABSTINENCE CHALLENGES
-- =============================================

CREATE TABLE IF NOT EXISTS public.abstinence_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('no_cigarettes', 'no_chips', 'no_chocolate', 'no_sugar', 'no_fastfood', 'no_coffee', 'no_alcohol')),
  challenge_name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reset_date TIMESTAMPTZ,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'failed')) DEFAULT 'active',
  target_days INTEGER DEFAULT 30,
  reward_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.abstinence_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.abstinence_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  success BOOLEAN NOT NULL,
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, log_date)
);

-- RLS for abstinence_challenges
ALTER TABLE public.abstinence_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" ON public.abstinence_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenges" ON public.abstinence_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenges" ON public.abstinence_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own challenges" ON public.abstinence_challenges FOR DELETE USING (auth.uid() = user_id);

-- RLS for abstinence_logs
ALTER TABLE public.abstinence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.abstinence_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.abstinence_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.abstinence_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON public.abstinence_logs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_abstinence_challenges
  BEFORE UPDATE ON public.abstinence_challenges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_user_id ON public.abstinence_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_type ON public.abstinence_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_status ON public.abstinence_challenges(is_active, status);
CREATE INDEX IF NOT EXISTS idx_abstinence_logs_challenge_id ON public.abstinence_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_abstinence_logs_user_date ON public.abstinence_logs(user_id, log_date);

-- =============================================
-- PART 12: SAMPLE DATA (German Products)
-- =============================================

-- Insert sample barcode products for testing
INSERT INTO public.products (
    code, name, brand, category,
    calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
    fiber_per_100g, sugar_per_100g, salt_per_100g, sodium_mg,
    supermarkets, stores, allergens,
    is_verified, verification_status, source, country
) VALUES
-- Coca Cola
('4000177050019', 'Coca-Cola Classic 0,33L Dose', 'Coca-Cola', 'beverages',
 42.0, 0.0, 10.6, 0.0, 0.0, 10.6, 0.01, 4.0,
 ARRAY['rewe', 'edeka', 'kaufland', 'netto'],
 ARRAY['Rewe', 'Edeka', 'Kaufland', 'Netto'],
 ARRAY[]::TEXT[],
 true, 'approved', 'manual', 'germany'),

-- Haribo Goldbären
('4001686301005', 'Haribo Goldbären 200g', 'Haribo', 'snacks',
 343.0, 6.9, 77.0, 0.5, 0.0, 46.0, 0.07, 28.0,
 ARRAY['rewe', 'edeka', 'dm', 'rossmann'],
 ARRAY['Rewe', 'Edeka', 'dm', 'Rossmann'],
 ARRAY['Gelatine'],
 true, 'approved', 'manual', 'germany'),

-- Milka Schokolade
('7622210002211', 'Milka Alpenmilch Schokolade 100g', 'Milka', 'snacks',
 534.0, 7.0, 56.0, 30.0, 2.5, 55.0, 0.18, 72.0,
 ARRAY['rewe', 'edeka', 'kaufland'],
 ARRAY['Rewe', 'Edeka', 'Kaufland'],
 ARRAY['Milch', 'Soja', 'Nüsse'],
 true, 'approved', 'manual', 'germany'),

-- Müller Milch
('40123456789012', 'Müller Milch Vanille 500ml', 'Müller', 'dairy',
 76.0, 3.1, 9.5, 3.8, 0.0, 9.2, 0.12, 48.0,
 ARRAY['rewe', 'edeka', 'kaufland'],
 ARRAY['Rewe', 'Edeka', 'Kaufland'],
 ARRAY['Milch'],
 true, 'approved', 'manual', 'germany'),

-- Knorr Nudeln
('8712100825903', 'Knorr Spaghetti Napoli', 'Knorr', 'pantry',
 350.0, 12.0, 70.0, 2.5, 4.0, 6.0, 2.8, 1120.0,
 ARRAY['rewe', 'edeka', 'kaufland', 'netto'],
 ARRAY['Rewe', 'Edeka', 'Kaufland', 'Netto'],
 ARRAY['Gluten', 'Ei'],
 true, 'approved', 'manual', 'germany')

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- PART 13: ENABLE REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_intake;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_logs;

-- =============================================
-- DATABASE SETUP COMPLETE! ✅
-- =============================================
-- All tables created with:
-- ✅ Row Level Security (RLS) enabled
-- ✅ Proper indexes for performance
-- ✅ Realtime subscriptions
-- ✅ Sample barcode data for testing
-- ✅ Automatic profile creation
-- =============================================
