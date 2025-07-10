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
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        throw error
      }
      
      // Check if onboarding is complete
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.session.user.id)
          .single()
        
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
        
        // Redirect to onboarding if not completed, otherwise to dashboard
        if (profile && !profile.onboarding_completed) {
          return NextResponse.redirect(`${siteUrl}/onboarding`)
        } else {
          return NextResponse.redirect(`${siteUrl}/dashboard`)
        }
      }
      
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
      return NextResponse.redirect(`${siteUrl}/login?error=auth_error`)
    }
  }

  // Fallback redirect to login
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
  return NextResponse.redirect(`${siteUrl}/login`)
}
