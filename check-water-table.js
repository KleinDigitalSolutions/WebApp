// Quick script to check if water_intake table exists in Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Checking Supabase connection and water_intake table...\n')
console.log('Supabase URL:', supabaseUrl ? '✅ SET' : '❌ NOT SET')
console.log('Service Role Key:', supabaseServiceKey ? '✅ SET' : '❌ NOT SET')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  try {
    // Try to select from water_intake table
    console.log('\n📊 Checking water_intake table...')
    const { data, error, count } = await supabase
      .from('water_intake')
      .select('*', { count: 'exact', head: false })
      .limit(5)

    if (error) {
      console.error('❌ Error accessing water_intake table:', error.message)
      console.error('Full error:', JSON.stringify(error, null, 2))

      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n⚠️  The water_intake table does NOT exist in your Supabase database!')
        console.log('You need to run the SQL from: tools/sql/water_intake_table.sql')
      }
      return
    }

    console.log('✅ water_intake table exists!')
    console.log(`📝 Total records: ${count}`)
    if (data && data.length > 0) {
      console.log('Sample records:', JSON.stringify(data, null, 2))
    } else {
      console.log('No records found (table is empty)')
    }

    // Try to insert a test record
    console.log('\n🧪 Testing insert operation...')
    const testUserId = '00000000-0000-0000-0000-000000000000' // Fake UUID for testing
    const testDate = new Date().toISOString().split('T')[0]

    const { data: insertData, error: insertError } = await supabase
      .from('water_intake')
      .upsert({
        user_id: testUserId,
        date: testDate,
        amount_ml: 500,
        daily_goal_ml: 2000
      }, {
        onConflict: 'user_id,date'
      })
      .select()

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message)
      console.error('Full error:', JSON.stringify(insertError, null, 2))
    } else {
      console.log('✅ Insert test successful!')

      // Clean up test record
      await supabase
        .from('water_intake')
        .delete()
        .eq('user_id', testUserId)
      console.log('🧹 Test record cleaned up')
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

checkTable()
