-- Tabelle für Check-ins im Fitnessstudio

CREATE TABLE public.check_ins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  check_out_time TIMESTAMPTZ,
  duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Index für schnellere Abfragen pro Nutzer
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);

-- RLS Policies (Row Level Security)
-- Nutzer können nur ihre eigenen Check-ins sehen
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see their own check-ins"
ON public.check_ins
FOR SELECT
USING (auth.uid() = user_id);

-- Nutzer können ihre eigenen Check-ins erstellen
CREATE POLICY "Allow users to create their own check-ins"
ON public.check_ins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Nutzer können ihre eigenen Check-ins aktualisieren (für Check-out)
CREATE POLICY "Allow users to update their own check-ins"
ON public.check_ins
FOR UPDATE
USING (auth.uid() = user_id);

-- Funktion, um die Dauer beim Check-out zu berechnen
CREATE OR REPLACE FUNCTION public.calculate_check_in_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger, der die Funktion vor jedem Update ausführt
CREATE TRIGGER set_check_in_duration
BEFORE UPDATE ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION public.calculate_check_in_duration();
