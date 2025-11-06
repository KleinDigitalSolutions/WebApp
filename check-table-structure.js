// Check actual table structure
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStructure() {
  try {
    // Get table structure using Postgres information_schema
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'water_intake'
          ORDER BY ordinal_position;
        `
      })

    if (error) {
      console.log('⚠️  RPC not available, trying alternative method...\n')

      // Alternative: Try to select with all possible columns
      const { data: testData, error: testError } = await supabase
        .from('water_intake')
        .select('*')
        .limit(1)

      if (testError) {
        console.error('Error:', testError)
      } else {
        console.log('✅ Successfully queried table')
        console.log('Sample structure (if any data exists):', testData)
        console.log('\nLet\'s try to see what columns are missing...')

        // Test each expected column
        const expectedColumns = ['user_id', 'date', 'amount_ml', 'daily_goal_ml', 'created_at', 'updated_at']

        for (const col of expectedColumns) {
          const { error: colError } = await supabase
            .from('water_intake')
            .select(col)
            .limit(1)

          if (colError) {
            console.log(`❌ Column '${col}': NOT FOUND`)
            console.log(`   Error: ${colError.message}`)
          } else {
            console.log(`✅ Column '${col}': EXISTS`)
          }
        }
      }
    } else {
      console.log('Table structure:')
      console.table(data)
    }

  } catch (err) {
    console.error('Error:', err)
  }
}

checkStructure()
