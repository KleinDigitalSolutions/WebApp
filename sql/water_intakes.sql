-- Create the water_intake table
CREATE TABLE public.water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  amount_ml INT DEFAULT 0 NOT NULL,
  daily_goal_ml INT DEFAULT 3000 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- 1. Users can see their own water intake records.
CREATE POLICY "Enable read access for own user"
ON public.water_intake
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can insert their own water intake records.
CREATE POLICY "Enable insert for own user"
ON public.water_intake
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own water intake records.
CREATE POLICY "Enable update for own user"
ON public.water_intake
FOR UPDATE
USING (auth.uid() = user_id);

-- Create the RPC function to add water
CREATE OR REPLACE FUNCTION add_water(intake_id UUID, amount INT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  updated_intake JSON;
BEGIN
  UPDATE public.water_intake
  SET amount_ml = amount_ml + amount
  WHERE id = intake_id
  RETURNING to_json(water_intake.*) INTO updated_intake;
  
  RETURN updated_intake;
END;
$$;
