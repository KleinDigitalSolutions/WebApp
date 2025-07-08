-- Migration: Add additional profile fields for onboarding
-- Run this SQL in your Supabase SQL editor

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS goals TEXT[],
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Update existing profiles table comment
COMMENT ON TABLE profiles IS 'User profiles with personal information including health goals and metrics';

-- Add comments for new columns
COMMENT ON COLUMN profiles.target_weight_kg IS 'User target weight in kg';
COMMENT ON COLUMN profiles.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN profiles.goals IS 'Array of user health and wellness goals';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the onboarding process';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in the onboarding process if not completed';

-- Optional: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
