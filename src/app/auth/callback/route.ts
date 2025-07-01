import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
      return NextResponse.redirect(`${siteUrl}/login?error=auth_error`)
    }
  }

  // URL to redirect to after sign in process completes
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
  return NextResponse.redirect(`${siteUrl}/dashboard`)
}
