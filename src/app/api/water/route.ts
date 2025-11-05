import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Debug: Log Service Role Key presence
console.log('DEBUG SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - Wassermenge für ein bestimmtes Datum abrufen
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'userId and date are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching water intake:', error)
      return NextResponse.json(
        { error: 'Failed to fetch water intake' },
        { status: 500 }
      )
    }

    // Return default values if no record found
    if (!data) {
      return NextResponse.json({
        amount_ml: 0,
        daily_goal_ml: 2000
      })
    }

    return NextResponse.json({
      amount_ml: data.amount_ml,
      daily_goal_ml: data.daily_goal_ml
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Wassermenge für ein bestimmtes Datum speichern/aktualisieren
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { userId, date, amount_ml, daily_goal_ml } = await request.json()

    if (!userId || !date || amount_ml === undefined) {
      return NextResponse.json(
        { error: 'userId, date, and amount_ml are required' },
        { status: 400 }
      )
    }
    
    // Upsert (insert or update) water intake record
    const { data, error } = await supabase
      .from('water_intake')
      .upsert({
        user_id: userId,
        date: date,
        amount_ml: amount_ml,
        daily_goal_ml: daily_goal_ml || 2000,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving water intake:', error)
      return NextResponse.json(
        { error: 'Failed to save water intake' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Water intake saved successfully',
      data: {
        amount_ml: data.amount_ml,
        daily_goal_ml: data.daily_goal_ml
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
