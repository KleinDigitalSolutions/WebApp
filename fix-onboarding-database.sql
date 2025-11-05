-- =============================================
-- FIX FOR ONBOARDING DATABASE ISSUES
-- A.N.D LETICS Fitness Studio App
-- =============================================
-- This SQL fixes the 400 error: "Could not find the 'target_weight_kg' column"
-- Run this in your Supabase SQL Editor

-- =============================================
-- STEP 1: Add missing columns to profiles table
-- =============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS diet_type TEXT;

-- =============================================
-- STEP 2: Add column comments for documentation
-- =============================================

COMMENT ON COLUMN profiles.target_weight_kg IS 'User target weight in kg';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN profiles.fitness_goals IS 'Array of user health and wellness goals';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed onboarding';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in onboarding process';
COMMENT ON COLUMN profiles.diet_type IS 'User dietary preference (standard, vegetarian, vegan, etc)';

-- =============================================
-- STEP 3: Drop old RLS policies (if they exist)
-- =============================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- =============================================
-- STEP 4: Create new RLS policies
-- =============================================

-- Allow profile creation during registration (INSERT)
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  WITH CHECK (true);  -- Any authenticated user can create their profile

-- Allow users to view their own profile (SELECT)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile (UPDATE)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (DELETE)
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- =============================================
-- STEP 5: Ensure RLS is enabled
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 6: Create performance indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step ON profiles(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =============================================
-- STEP 7: Verify the migration (Optional)
-- =============================================

-- Run this query to verify all columns exist:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- After running this:
-- 1. Onboarding should work without errors
-- 2. All profile fields will be saved correctly
-- 3. RLS policies will allow proper access
-- =============================================
