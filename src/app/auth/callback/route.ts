import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login`)
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      throw error
    }

    const user = data.session?.user

    if (!user) {
      return NextResponse.redirect(`${siteUrl}/login`)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error checking profile during callback:', profileError)
    }

    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email?.toLowerCase() ?? null,
          onboarding_completed: false,
          onboarding_step: 1,
          show_onboarding: true,
        })

      if (insertError) {
        console.error('Failed to create profile during callback:', insertError)
      }

      return NextResponse.redirect(`${siteUrl}/onboarding`)
    }

    if (!profile.onboarding_completed) {
      return NextResponse.redirect(`${siteUrl}/onboarding`)
    }

    return NextResponse.redirect(`${siteUrl}/dashboard`)
  } catch (error) {
    console.error('Error exchanging code for session:', error)
    return NextResponse.redirect(`${siteUrl}/login?error=auth_error`)
  }
}
