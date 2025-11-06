const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role für Admin-Zugriff

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminTable() {
  console.log('🔍 Prüfe admin_users Tabelle mit Service Role Key...\n');

  try {
    const { data, error, count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact' });

    if (error) {
      console.log('❌ Fehler:', error.message);
      console.log('Details:', JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ admin_users Tabelle: OK (${count || 0} Einträge)`);
      if (data && data.length > 0) {
        console.log('\nAdmin-User:');
        data.forEach(admin => {
          console.log(`  - ${admin.email} (${admin.role})`);
        });
      } else {
        console.log('\nℹ️  Keine Admin-User vorhanden (normal bei Neuinstallation)');
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

checkAdminTable().catch(console.error);
