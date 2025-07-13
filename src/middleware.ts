import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle water API
  if (pathname === '/api/water') {
    if (request.method === 'GET') {
      try {
        const { data, error } = await supabase
          .from('water_intake')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(7)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
      } catch (error) {
        console.error('Error fetching water intake:', error)
        return NextResponse.json({ error: 'Failed to fetch water intake' }, { status: 500 })
      }
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json()
        const { amount_ml } = body

        const { data, error } = await supabase
          .from('water_intake')
          .insert([{ amount_ml }])
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
      } catch (error) {
        console.error('Error adding water intake:', error)
        return NextResponse.json({ error: 'Failed to add water intake' }, { status: 500 })
      }
    }
  }

  // Handle insights API
  if (pathname === '/api/insights') {
    if (request.method === 'GET') {
      try {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .single()

        if (userError) {
          return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
        }

        const today = new Date().toISOString().split('T')[0]
        const { data: diaryData, error: diaryError } = await supabase
          .from('diary_entries')
          .select('*')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)

        if (diaryError) {
          return NextResponse.json({ error: 'Failed to fetch diary entries' }, { status: 500 })
        }

        const { data: waterData, error: waterError } = await supabase
          .from('water_intake')
          .select('*')
          .eq('date', today)
          .single()

        if (waterError && waterError.code !== 'PGRST116') {
          return NextResponse.json({ error: 'Failed to fetch water intake' }, { status: 500 })
        }

        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)

        if (activityError) {
          return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
        }

        return NextResponse.json({
          userData,
          diaryData,
          waterData,
          activityData
        })
      } catch (error) {
        console.error('Error generating insight:', error)
        return NextResponse.json(
          { error: 'Failed to generate insight' },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/water', '/api/insights']
} 