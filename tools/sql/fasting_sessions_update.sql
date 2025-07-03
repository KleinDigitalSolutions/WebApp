-- =====================================================
-- Fasting Sessions Table Update
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- The table already exists with these columns:
-- id, user_id, plan, start_time, end_time, is_active, created_at, updated_at, status, target_duration_hours, fasting_type, notes

-- Just ensure RLS and policies are set up correctly
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
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_is_active ON public.fasting_sessions(is_active);

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
-- UPDATE COMPLETE
-- =====================================================