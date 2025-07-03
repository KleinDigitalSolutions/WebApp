-- Fix fasting_sessions table - make end_time nullable
ALTER TABLE public.fasting_sessions 
ALTER COLUMN end_time DROP NOT NULL;