-- =====================================================
-- ADD ONBOARDING COLUMNS TO PROFILES TABLE
-- =====================================================
-- Diese Migration fügt die fehlenden Onboarding-Spalten hinzu
-- Verwenden Sie diese, wenn Sie NICHT die gesamte Datenbank zurücksetzen wollen
-- =====================================================

-- Füge fehlende Spalten zur profiles Tabelle hinzu
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS diet_type TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS show_onboarding BOOLEAN DEFAULT TRUE;

-- Setze Standardwerte für bestehende User
UPDATE public.profiles
SET
  onboarding_completed = COALESCE(onboarding_completed, FALSE),
  onboarding_step = COALESCE(onboarding_step, 1),
  show_onboarding = COALESCE(show_onboarding, TRUE)
WHERE onboarding_completed IS NULL
   OR onboarding_step IS NULL
   OR show_onboarding IS NULL;

-- Füge Kommentare hinzu
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed the onboarding process';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in the onboarding process (1-9)';
COMMENT ON COLUMN profiles.show_onboarding IS 'Whether to show onboarding to the user';
COMMENT ON COLUMN profiles.email IS 'User email address';
COMMENT ON COLUMN profiles.target_weight_kg IS 'User target weight in kilograms';
COMMENT ON COLUMN profiles.diet_type IS 'User preferred diet type';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Die Onboarding-Spalten wurden erfolgreich hinzugefügt!
-- Ihre App sollte jetzt korrekt zur Onboarding-Seite weiterleiten.
-- =====================================================
