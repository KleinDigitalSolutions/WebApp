import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const limit = Number(searchParams.get('limit') || 12)
  const random = searchParams.get('random')

  let query = supabase.from('recipes').select('*')
  if (category) query = query.ilike('category', `%${category}%`)
  if (q) query = query.or(`title.ilike.%${q}%,ingredients.cs.{${q}}`)
  if (random) query = query.order('random()').limit(limit)
  else query = query.limit(limit)

  const { data, error } = await query
  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  return new Response(JSON.stringify({ recipes: data }), { status: 200 })
}
