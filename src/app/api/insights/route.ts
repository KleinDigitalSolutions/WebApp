import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function GET() {
  try {
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    // Get today's diary entries
    const today = new Date().toISOString().split('T')[0]
    const { data: diaryData, error: diaryError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('date', today)

    if (diaryError) {
      return NextResponse.json({ error: 'Failed to fetch diary entries' }, { status: 500 })
    }

    // Generate AI insight
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `Based on the user's data:
      - Current weight: ${userData.weight}kg
      - Target weight: ${userData.target_weight}kg
      - Height: ${userData.height}cm
      - Activity level: ${userData.activity_level}
      
      And today's diary entries:
      ${JSON.stringify(diaryData)}
      
      Generate a short, personalized health insight in German. Focus on motivation and actionable advice.
      Keep it under 100 words and make it sound natural and encouraging.`

    const result = await model.generateContent(prompt)
    const insight = result.response.text()

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('Error generating insight:', error)
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    )
  }
} 