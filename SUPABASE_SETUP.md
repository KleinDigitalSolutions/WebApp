# Supabase Setup für A.N.D LETICS

## 🚀 Schritt 1: Neues Supabase-Projekt erstellen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Klicke auf **"New Project"**
3. Wähle eine Organisation oder erstelle eine neue
4. Gib dem Projekt einen Namen: **`andletics-fitness`**
5. Wähle eine **Database Password** (WICHTIG: Speicher das!)
6. Wähle eine Region (z.B. Frankfurt/Europe)
7. Klicke auf **"Create new project"**
8. Warte 2-3 Minuten bis das Projekt bereit ist

---

## 📊 Schritt 2: SQL-Schema ausführen

Gehe in deinem Supabase-Projekt zu:
**SQL Editor** (im linken Menü) → **"New Query"**

Kopiere und führe folgendes SQL aus:

```sql
-- =============================================
-- A.N.D LETICS FITNESS STUDIO DATABASE SCHEMA
-- =============================================

-- 1. PROFILES TABLE (Erweitert für Fitness-Studio)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,

  -- Fitness-spezifische Felder
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),

  -- Mitgliedschaft
  membership_type TEXT CHECK (membership_type IN ('basic', 'premium', 'vip')),
  membership_start_date DATE,
  membership_end_date DATE,
  is_active BOOLEAN DEFAULT true,

  -- Fitness-Ziele
  fitness_goals TEXT[],
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,

  -- Ernährung (von TrackFood übernommen)
  diet_type TEXT,
  intolerances TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security für profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 2. WORKOUTS TABLE (Training-Logs)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_name TEXT NOT NULL,
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'sports', 'other')),
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  workout_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);


-- 3. EXERCISES TABLE (Übungen in Workouts)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg DECIMAL(5,2),
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM workouts WHERE id = workout_id));

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM workouts WHERE id = workout_id));

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM workouts WHERE id = workout_id));

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM workouts WHERE id = workout_id));


-- 4. CLASSES TABLE (Kurse)
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL,
  class_type TEXT CHECK (class_type IN ('yoga', 'spinning', 'pilates', 'hiit', 'boxing', 'zumba', 'crossfit', 'other')),
  instructor_name TEXT,
  description TEXT,
  duration_minutes INTEGER,
  max_participants INTEGER DEFAULT 20,
  room TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 5. CLASS_SCHEDULES TABLE (Kurs-Termine)
CREATE TABLE IF NOT EXISTS class_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  current_participants INTEGER DEFAULT 0,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 6. CLASS_BOOKINGS TABLE (Kurs-Buchungen)
CREATE TABLE IF NOT EXISTS class_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES class_schedules(id) ON DELETE CASCADE,
  booking_status TEXT CHECK (booking_status IN ('confirmed', 'waitlist', 'cancelled')) DEFAULT 'confirmed',
  checked_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, schedule_id)
);

ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON class_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON class_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON class_bookings FOR DELETE
  USING (auth.uid() = user_id);


-- 7. CHECK_INS TABLE (Studio Check-ins)
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  check_in_type TEXT CHECK (check_in_type IN ('qr', 'manual', 'auto')) DEFAULT 'qr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 8. CHALLENGES TABLE (Fitness-Challenges)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_name TEXT NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('steps', 'workouts', 'calories', 'duration', 'weight_loss', 'custom')),
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own challenges"
  ON challenges FOR ALL
  USING (auth.uid() = user_id);


-- 9. BODY_MEASUREMENTS TABLE (Körpermaße)
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  thighs_cm DECIMAL(5,2),
  arms_cm DECIMAL(5,2),
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measurements"
  ON body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own measurements"
  ON body_measurements FOR ALL
  USING (auth.uid() = user_id);


-- 10. NUTRITION (Von TrackFood übernommen)
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity DECIMAL(8,2),
  unit TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carb_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),
  sugar_g DECIMAL(6,2),
  sodium_mg INTEGER,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary entries"
  ON diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diary entries"
  ON diary_entries FOR ALL
  USING (auth.uid() = user_id);


-- 11. WATER INTAKE TABLE
CREATE TABLE IF NOT EXISTS water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  intake_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own water intake"
  ON water_intake FOR ALL
  USING (auth.uid() = user_id);


-- =============================================
-- INDEXES FÜR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_workout ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_user ON class_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_schedule ON class_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_start ON class_schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_time ON check_ins(user_id, check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON diary_entries(user_id, entry_date DESC);


-- =============================================
-- TRIGGER FÜR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =============================================
-- ERFOLG!
-- =============================================
-- Die Datenbank ist jetzt bereit für A.N.D LETICS! 💪
```

---

## 🔑 Schritt 3: API-Keys finden

1. Gehe in deinem Supabase-Projekt zu **"Settings"** (unten links)
2. Klicke auf **"API"**
3. Du findest dort:
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public Key**: `eyJhbGci...` (sehr lang)
   - **service_role Key**: `eyJhbGci...` (sehr lang, geheim!)

---

## 🔧 Schritt 4: Keys in die App eintragen

Öffne die Datei `.env.local` in deinem Projekt und ersetze:

```bash
# Alte Dummy-Werte ERSETZEN mit echten Werten:

NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...DEIN-ANON-KEY...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...DEIN-SERVICE-ROLE-KEY...
```

**WICHTIG:**
- Ersetze `DEIN-PROJECT-ID` mit deiner echten Project URL
- Kopiere die Keys KOMPLETT (sind sehr lang!)
- Speichere die Datei

---

## 👤 Schritt 5: Auth-Einstellungen in Supabase

1. Gehe zu **"Authentication"** → **"Providers"**
2. **Email Auth** ist standardmäßig aktiviert ✅
3. **Optional - Google OAuth**:
   - Klicke auf "Google"
   - Aktiviere "Enable Google provider"
   - Du brauchst Google OAuth Credentials (später)

### Email Auth Settings:
1. Gehe zu **"Authentication"** → **"Email Templates"**
2. **Wichtig**: Deaktiviere Email-Bestätigung für schnelles Testing:
   - Gehe zu **"Settings"** → **"Authentication"**
   - Unter **"Email Auth"** → **"Confirm email"** auf **OFF** setzen

---

## 🎯 Schritt 6: Ersten User anlegen

### Option A: Über die App (Empfohlen)
1. Starte den Dev-Server: `npm run dev`
2. Öffne http://localhost:3001
3. Klicke auf "Jetzt registrieren"
4. Registriere dich mit Email/Passwort
5. Du wirst automatisch eingeloggt!

### Option B: Direkt in Supabase
1. Gehe zu **"Authentication"** → **"Users"**
2. Klicke auf **"Add user"** → **"Create new user"**
3. Gib Email + Passwort ein
4. **Auto Confirm User**: AN ✅
5. Klicke **"Create user"**

---

## 🧪 Schritt 7: Testen

1. Server neu starten (falls läuft):
   ```bash
   # Im Terminal Ctrl+C drücken, dann:
   npm run dev
   ```

2. Öffne http://localhost:3001

3. Klicke **"Login"** und melde dich an!

4. Du solltest jetzt zum **Onboarding** weitergeleitet werden

---

## ✅ Fertig!

Die App ist jetzt verbunden mit deiner echten Supabase-Datenbank!

### Was funktioniert jetzt:
- ✅ Registrierung
- ✅ Login
- ✅ Profil-Speicherung
- ✅ Alle Tabellen sind bereit

### Nächste Schritte:
- Mitglieder anlegen
- Kurse erstellen (direkt in Supabase)
- Check-ins testen
- Dashboard anpassen

---

## 🆘 Troubleshooting

**Problem: "Invalid API Key"**
- Prüfe ob die Keys richtig kopiert wurden (sehr lang!)
- Keine Leerzeichen vor/nach dem Key
- Server neu starten: `npm run dev`

**Problem: "Row Level Security"**
- SQL-Skript komplett ausgeführt?
- Alle Policies erstellt?

**Problem: "User already exists"**
- Gehe zu Supabase → Authentication → Users
- Lösche Test-User oder nutze andere Email
