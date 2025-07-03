-- =====================================================
-- Abstinence Challenges Table
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- Create abstinence_challenges table
CREATE TABLE IF NOT EXISTS public.abstinence_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Challenge details
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('no_cigarettes', 'no_chips', 'no_chocolate', 'no_sugar', 'no_fastfood', 'no_coffee', 'no_alcohol')),
  challenge_name TEXT NOT NULL,
  
  -- Progress tracking
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reset_date TIMESTAMPTZ, -- When user broke the streak
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 1,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'failed')) DEFAULT 'active',
  
  -- Goal and rewards
  target_days INTEGER DEFAULT 30, -- Default 30-day challenge
  reward_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create abstinence_logs table for daily tracking
CREATE TABLE IF NOT EXISTS public.abstinence_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.abstinence_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Daily log entry
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  success BOOLEAN NOT NULL, -- true = resisted, false = gave in
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5), -- 1-5 mood scale
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries per day
  UNIQUE(challenge_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE public.abstinence_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abstinence_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for abstinence_challenges
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

-- RLS Policies for abstinence_logs
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_user_id ON public.abstinence_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_type ON public.abstinence_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_abstinence_challenges_status ON public.abstinence_challenges(is_active, status);
CREATE INDEX IF NOT EXISTS idx_abstinence_logs_challenge_id ON public.abstinence_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_abstinence_logs_user_date ON public.abstinence_logs(user_id, log_date);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_abstinence_challenges
  BEFORE UPDATE ON public.abstinence_challenges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate current streak
CREATE OR REPLACE FUNCTION calculate_current_streak(p_challenge_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  log_record RECORD;
BEGIN
  -- Count consecutive successful days from today backwards
  FOR log_record IN 
    SELECT success, log_date 
    FROM abstinence_logs 
    WHERE challenge_id = p_challenge_id 
    ORDER BY log_date DESC
  LOOP
    IF log_record.success THEN
      streak_count := streak_count + 1;
    ELSE
      EXIT; -- Break streak on first failure
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.abstinence_logs;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
-- 1. abstinence_challenges - Main challenge tracking
-- 2. abstinence_logs - Daily success/failure logs
-- 
-- Features:
-- - Track multiple challenges per user
-- - Daily logging with success/failure
-- - Streak calculation
-- - Mood tracking
-- - Target goals and rewards
-- =====================================================