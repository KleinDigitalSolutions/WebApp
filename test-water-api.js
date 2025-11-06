// Test the water API directly
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 Testing Water API...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWaterAPI() {
  // Get a test user (first user in the database)
  console.log('📋 Step 1: Getting a test user...')
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()

  if (userError || !users || users.users.length === 0) {
    console.error('❌ No users found. Please sign up first.')
    return
  }

  const testUser = users.users[0]
  console.log(`✅ Using user: ${testUser.email} (${testUser.id})`)

  // Test INSERT
  console.log('\n📋 Step 2: Testing INSERT...')
  const testDate = new Date().toISOString().split('T')[0]
  const testData = {
    user_id: testUser.id,
    date: testDate,
    amount_ml: 500,
    daily_goal_ml: 2000,
    updated_at: new Date().toISOString()
  }

  console.log('Attempting to insert:', testData)

  const { data: insertData, error: insertError } = await supabase
    .from('water_intake')
    .upsert(testData, {
      onConflict: 'user_id,date'
    })
    .select()
    .single()

  if (insertError) {
    console.error('❌ INSERT FAILED:', insertError.message)
    console.error('Error code:', insertError.code)
    console.error('Error details:', insertError.details)
    console.error('Full error:', JSON.stringify(insertError, null, 2))

    // Try to get more info about the table
    console.log('\n📋 Step 3: Checking table columns...')
    const { data: tableInfo, error: infoError } = await supabase
      .from('water_intake')
      .select('*')
      .limit(1)

    if (infoError) {
      console.error('Error getting table info:', infoError.message)
    } else {
      console.log('Table structure sample:', tableInfo)
    }

    return
  }

  console.log('✅ INSERT SUCCESS!')
  console.log('Inserted data:', insertData)

  // Test SELECT
  console.log('\n📋 Step 3: Testing SELECT...')
  const { data: selectData, error: selectError } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', testUser.id)
    .eq('date', testDate)
    .single()

  if (selectError) {
    console.error('❌ SELECT FAILED:', selectError.message)
    return
  }

  console.log('✅ SELECT SUCCESS!')
  console.log('Retrieved data:', selectData)

  // Cleanup
  console.log('\n🧹 Cleaning up test data...')
  await supabase
    .from('water_intake')
    .delete()
    .eq('user_id', testUser.id)
    .eq('date', testDate)

  console.log('✅ Test completed successfully! The API and table are working correctly.')
}

testWaterAPI().catch(err => {
  console.error('💥 Unexpected error:', err)
})
