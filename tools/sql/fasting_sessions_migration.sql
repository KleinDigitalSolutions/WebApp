-- =====================================================
-- Fasting Sessions Table Migration
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- First, check what columns exist and add missing ones
-- Add columns only if they don't exist
ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active';

ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS target_duration_hours INTEGER NOT NULL DEFAULT 16;

ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS fasting_type TEXT CHECK (fasting_type IN ('intermittent_16_8', 'intermittent_18_6', 'intermittent_20_4', 'custom')) DEFAULT 'intermittent_16_8';

ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure start_time and end_time exist
ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Add user_id reference if not exists
ALTER TABLE public.fasting_sessions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can insert own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can update own fasting sessions" ON public.fasting_sessions;
DROP POLICY IF EXISTS "Users can delete own fasting sessions" ON public.fasting_sessions;

-- Create RLS policies
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

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_id ON public.fasting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_status ON public.fasting_sessions(status);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_start_time ON public.fasting_sessions(start_time);

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at_fasting_sessions ON public.fasting_sessions;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_fasting_sessions
  BEFORE UPDATE ON public.fasting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for fasting_sessions table (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'fasting_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions;
  END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration will:
-- 1. Add missing columns to existing fasting_sessions table
-- 2. Set up RLS policies
-- 3. Add performance indexes
-- 4. Enable realtime subscriptions
-- =====================================================