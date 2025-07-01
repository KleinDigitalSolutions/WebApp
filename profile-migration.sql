-- Migration: Add first_name and last_name to profiles table
-- Run this SQL in your Supabase SQL editor

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing profiles table comment
COMMENT ON TABLE profiles IS 'User profiles with personal information including names';

-- Add comments for new columns
COMMENT ON COLUMN profiles.first_name IS 'User first name';
COMMENT ON COLUMN profiles.last_name IS 'User last name';

-- Optional: Add indexes for better performance if needed
-- CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
-- CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);
