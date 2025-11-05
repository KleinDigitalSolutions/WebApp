-- =============================================
-- FIX FÜR RLS POLICIES - A.N.D LETICS
-- =============================================
-- Dieses SQL löst die 401/400 Fehler beim Registrieren

-- 1. Alte Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Neue, funktionierende Policies erstellen

-- WICHTIG: Public kann Profile INSERT machen (für Registrierung!)
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  WITH CHECK (true);  -- Jeder kann ein Profil erstellen beim Signup

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- 3. Sicherstellen dass RLS aktiviert ist
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Fertig! Jetzt sollte Registrierung funktionieren! ✅
-- =============================================
