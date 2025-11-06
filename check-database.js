const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Prüfe Supabase-Datenbank...\n');
  console.log('📡 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...\n');

  const tables = [
    'profiles',
    'diary_entries',
    'recipes',
    'weight_history',
    'products',
    'product_reviews',
    'product_reports',
    'water_intake',
    'fasting_sessions',
    'abstinence_challenges',
    'abstinence_logs',
    'admin_users'
  ];

  let allGood = true;

  console.log('📋 Prüfe Tabellen:\n');

  for (const table of tables) {
    try {
      // Versuche eine einfache SELECT-Abfrage
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(25)} - FEHLER: ${error.message}`);
        allGood = false;
      } else {
        console.log(`✅ ${table.padEnd(25)} - OK (${count || 0} Einträge)`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(25)} - EXCEPTION: ${err.message}`);
      allGood = false;
    }
  }

  console.log('\n📊 Prüfe profiles Tabelle Struktur:\n');

  try {
    // Prüfe ob alle wichtigen Spalten in profiles existieren
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Konnte profiles Struktur nicht prüfen:', error.message);
      allGood = false;
    } else {
      const expectedColumns = [
        'id',
        'first_name',
        'last_name',
        'email',
        'age',
        'gender',
        'height_cm',
        'weight_kg',
        'target_weight_kg',
        'activity_level',
        'goal',
        'diet_type',
        'dietary_restrictions',
        'health_conditions',
        'onboarding_completed',
        'onboarding_step',
        'show_onboarding',
        'created_at',
        'updated_at'
      ];

      // Prüfe ob Daten vorhanden sind
      if (data && data.length > 0) {
        const actualColumns = Object.keys(data[0]);
        console.log('Gefundene Spalten:', actualColumns.join(', '));

        for (const col of expectedColumns) {
          if (actualColumns.includes(col)) {
            console.log(`✅ ${col}`);
          } else {
            console.log(`❌ ${col} - FEHLT!`);
            allGood = false;
          }
        }
      } else {
        console.log('ℹ️  Keine Daten in profiles vorhanden (Tabelle ist leer)');
        console.log('   Dies ist normal, wenn noch keine User registriert sind.');
      }
    }
  } catch (err) {
    console.log('❌ Fehler beim Prüfen der profiles Struktur:', err.message);
    allGood = false;
  }

  console.log('\n🔍 Prüfe Beispiel-Produkte:\n');

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(3);

    if (error) {
      console.log('❌ Fehler beim Laden der Produkte:', error.message);
    } else {
      console.log(`✅ ${data.length} Beispiel-Produkte gefunden:`);
      data.forEach(product => {
        console.log(`   - ${product.name} (${product.brand})`);
      });
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ ALLES KORREKT EINGERICHTET!');
    console.log('✅ Ihre Datenbank ist bereit zu verwenden!');
  } else {
    console.log('❌ FEHLER GEFUNDEN!');
    console.log('⚠️  Bitte prüfen Sie die Fehler oben.');
  }
  console.log('='.repeat(50) + '\n');
}

checkDatabase().catch(console.error);
