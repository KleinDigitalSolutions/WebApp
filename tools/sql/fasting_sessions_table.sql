-- =====================================================
-- Fasting Sessions Table
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- Create fasting_sessions table
CREATE TABLE IF NOT EXISTS public.fasting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Fasting session details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  target_duration_hours INTEGER NOT NULL DEFAULT 16, -- Default 16 hours
  
  -- Session status
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  
  -- Additional metadata
  fasting_type TEXT CHECK (fasting_type IN ('intermittent_16_8', 'intermittent_18_6', 'intermittent_20_4', 'custom')) DEFAULT 'intermittent_16_8',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_id ON public.fasting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_status ON public.fasting_sessions(status);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_start_time ON public.fasting_sessions(start_time);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at_fasting_sessions
  BEFORE UPDATE ON public.fasting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for fasting_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.fasting_sessions;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The fasting_sessions table is now ready for use:
-- - Users can start, stop, and track fasting sessions
-- - RLS policies ensure users only see their own sessions
-- - Indexes provide good performance
-- - Realtime subscriptions are enabled
-- =====================================================