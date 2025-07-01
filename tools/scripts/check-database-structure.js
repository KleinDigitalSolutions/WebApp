#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStructure() {
  console.log('🔍 Checking NutriWise Database Structure...\n');

  // Check each table and its structure
  const tables = [
    'profiles',
    'diary_entries', 
    'products',
    'recipes',
    'water_intake',
    'admin_users'
  ];

  for (const table of tables) {
    try {
      // Get table structure by fetching one row
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
        continue;
      }

      console.log(`✅ Table '${table}': ${count || 0} rows`);
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`   Columns: ${columns.join(', ')}`);
      }
      
      // Special checks for important tables
      if (table === 'products') {
        const { data: sampleProducts } = await supabase
          .from('products')
          .select('name, barcode, brand')
          .not('barcode', 'is', null)
          .limit(3);
        
        if (sampleProducts && sampleProducts.length > 0) {
          console.log(`   Sample products with barcodes:`);
          sampleProducts.forEach(p => {
            console.log(`     - ${p.name} (${p.brand}) - ${p.barcode}`);
          });
        }
      }
      
      if (table === 'diary_entries') {
        const { data: recentEntries } = await supabase
          .from('diary_entries')
          .select('food_name, calories_per_100g, created_at')
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (recentEntries && recentEntries.length > 0) {
          console.log(`   Recent diary entries:`);
          recentEntries.forEach(e => {
            console.log(`     - ${e.food_name} (${e.calories_per_100g} cal/100g)`);
          });
        }
      }

      console.log('');
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}\n`);
    }
  }

  // Check RLS policies
  console.log('🔒 Checking Row Level Security (RLS) policies...');
  try {
    const { data, error } = await supabase.rpc('check_rls_status');
    if (error) {
      console.log('⚠️  Could not check RLS status');
    }
  } catch (err) {
    console.log('⚠️  RLS check not available');
  }

  console.log('\n✅ Database structure check completed!');
}

checkDatabaseStructure().catch(console.error);
