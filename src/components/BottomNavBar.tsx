'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, logout])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/login')
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/diary', label: 'Tagebuch', icon: '📝' },
    { href: '/recipes', label: 'Rezepte', icon: '🍳' },
    { href: '/chat', label: 'KI-Coach', icon: '🤖' },
    { href: '/profile', label: 'Profil', icon: '👤' },
  ]

  if (!user) {
    return null
  }

  return (
    <>
      {/* Bottom Navigation - Always visible */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-screen-2xl mx-auto">
          {/* Mobile Layout */}
          <div className="flex justify-around items-center py-2 px-2 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  pathname === item.href
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="text-xs font-medium leading-none truncate">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Layout - Large screens and up */}
          <div className="hidden lg:flex justify-center items-center py-4 px-8">
            <div className="flex space-x-12 items-center">
              {/* Navigation Items */}
              <div className="flex space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-green-100 text-green-700 font-semibold shadow-sm'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* User Info & Logout - Desktop only */}
              <div className="flex items-center space-x-6 ml-12 pl-12 border-l border-gray-200">
                <div className="text-sm text-gray-600 max-w-48 truncate">
                  {user.email}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="px-4 py-2">
                  Abmelden
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu for User Actions */}
      <div className="lg:hidden">
        {/* Floating User Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg border border-gray-200 transition-colors"
        >
          <span className="sr-only">User menu</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {/* Mobile User Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
            <div className="fixed top-16 right-4 bg-white rounded-lg shadow-xl border p-4 min-w-48">
              <div className="text-sm text-gray-600 mb-3 pb-3 border-b truncate">
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm text-red-600 hover:text-red-800 py-2"
              >
                Abmelden
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
