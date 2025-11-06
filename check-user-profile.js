const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '664edf93-724e-47f6-a057-25a88cbd7cf9';

async function checkUserProfile() {
  console.log('🔍 Prüfe User-Profil...\n');
  console.log('User ID:', userId, '\n');

  // Prüfe ob User existiert
  console.log('1. Prüfe auth.users:');
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

  if (authError) {
    console.log('❌ Fehler:', authError.message);
  } else if (authUser) {
    console.log('✅ User existiert in auth.users');
    console.log('   Email:', authUser.user.email);
    console.log('   Created:', authUser.user.created_at);
    console.log('   Email confirmed:', authUser.user.email_confirmed_at ? 'Ja' : 'Nein');
  }

  console.log('\n2. Prüfe profiles Tabelle:');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.log('❌ FEHLER:', profileError.message);
    console.log('❌ DAS IST DAS PROBLEM! Profil fehlt!\n');

    console.log('🔧 Erstelle Profil für User...');
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: authUser?.user?.email,
        onboarding_completed: false,
        onboarding_step: 1,
        show_onboarding: true
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Fehler beim Erstellen:', insertError.message);
    } else {
      console.log('✅ Profil erfolgreich erstellt!');
      console.log('   Onboarding Status:', newProfile);
    }
  } else if (profile) {
    console.log('✅ Profil existiert');
    console.log('\nProfil-Daten:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID:', profile.id);
    console.log('Email:', profile.email || '(nicht gesetzt)');
    console.log('Name:', profile.first_name || '(nicht gesetzt)', profile.last_name || '');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Onboarding completed:', profile.onboarding_completed);
    console.log('Onboarding step:', profile.onboarding_step);
    console.log('Show onboarding:', profile.show_onboarding);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Age:', profile.age || '(nicht gesetzt)');
    console.log('Gender:', profile.gender || '(nicht gesetzt)');
    console.log('Height:', profile.height_cm || '(nicht gesetzt)');
    console.log('Weight:', profile.weight_kg || '(nicht gesetzt)');
    console.log('Target Weight:', profile.target_weight_kg || '(nicht gesetzt)');
    console.log('Goal:', profile.goal || '(nicht gesetzt)');
    console.log('Diet Type:', profile.diet_type || '(nicht gesetzt)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Prüfe ob Onboarding-Felder fehlen
    if (profile.onboarding_completed === null || profile.onboarding_step === null) {
      console.log('⚠️  PROBLEM: Onboarding-Felder sind NULL!\n');
      console.log('🔧 Aktualisiere Profil...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_step: 1,
          show_onboarding: true
        })
        .eq('id', userId);

      if (updateError) {
        console.log('❌ Fehler beim Update:', updateError.message);
      } else {
        console.log('✅ Profil erfolgreich aktualisiert!');
      }
    } else if (profile.onboarding_completed === true) {
      console.log('ℹ️  Onboarding ist bereits abgeschlossen.');
      console.log('   User sollte zum Dashboard weitergeleitet werden.');
    } else {
      console.log('ℹ️  Onboarding ist NICHT abgeschlossen.');
      console.log('   User sollte zu /onboarding weitergeleitet werden.');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Bitte laden Sie die Seite neu (F5)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkUserProfile().catch(console.error);
