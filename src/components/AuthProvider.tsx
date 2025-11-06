'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'

// Paths that don't require authentication or onboarding checks
const publicPaths = ['/', '/login', '/register', '/datenschutz', '/impressum', '/agb']
// Paths that are part of the auth flow but don't need onboarding checks
const authPaths = ['/auth/callback', '/auth/confirm']
// Paths that explicitly need onboarding checks - will force redirect to onboarding if not completed
const requireOnboardingPaths = ['/profile', '/profil']

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Check if we're on a path that doesn't need auth/onboarding checks
  const isPublicPath = publicPaths.includes(pathname) || authPaths.includes(pathname) || pathname.startsWith('/auth/')

  useEffect(() => {
    // Get initial session and set up auth listener
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          if (profileError) {
            console.error('Error fetching profile during initAuth:', profileError)
          }
            
          // Besondere Behandlung für Seiten, die explizit Onboarding benötigen
          if (profile && !profile.onboarding_completed && requireOnboardingPaths.includes(pathname)) {
            router.push('/onboarding')
            setIsLoading(false)
            return
          }
          
          if (profile) {
            setProfile(profile)
            
            // Check if we need to redirect to onboarding
            // Only redirect if:
            // 1. Onboarding is not completed
            // 2. We're not already on the onboarding page
            // 3. We're not on a public/auth path
            if (!profile.onboarding_completed && 
                !pathname.startsWith('/onboarding') && 
                !isPublicPath) {
              router.push('/onboarding')
              return
            }
          } else {
            // For non-public routes, redirect to login if not authenticated
            if (!isPublicPath) {
              router.push('/login')
              return
            }
          }
        } else {
          // For non-public routes, redirect to login if not authenticated
          if (!isPublicPath) {
            router.push('/login')
            return
          }
        }
      } catch (error) {
        console.error('Error in auth provider:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          if (profileError) {
            console.error('Error fetching profile during auth state change:', profileError)
          }
            
          // Besondere Behandlung für Seiten, die explizit Onboarding benötigen
          if (profile && !profile.onboarding_completed && requireOnboardingPaths.includes(pathname)) {
            router.push('/onboarding')
            return
          }
            
          if (profile) {
            setProfile(profile)
            
            // Redirect to onboarding if not completed and not on auth/public paths
            if (!profile.onboarding_completed && !pathname.startsWith('/onboarding') && !isPublicPath) {
              router.push('/onboarding')
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          
          // Redirect to login for protected routes
          if (!isPublicPath) {
            router.push('/login')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, setProfile, setUser, isPublicPath])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
