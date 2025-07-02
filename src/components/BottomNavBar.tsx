'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui'
import { Home, BookOpen, ChefHat, User, PlusCircle } from 'lucide-react'

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

  // Neue NavItems mit Lucide-Icons und Hinzufügen-Button in der Mitte
  const navItems = [
    {
      href: '/dashboard',
      icon: <Home size={24} />, // Startseite
      label: 'Start',
      isActive: pathname === '/dashboard',
    },
    {
      href: '/diary',
      icon: <BookOpen size={24} />, // Tagebuch
      label: 'Tagebuch',
      isActive: pathname === '/diary',
    },
    {
      href: '/diary/add',
      icon: <PlusCircle size={28} />, // Hinzufügen (zentral)
      label: 'Hinzufügen',
      isActive: pathname === '/diary/add',
    },
    {
      href: '/recipes',
      icon: <ChefHat size={24} />, // Rezepte
      label: 'Rezepte',
      isActive: pathname === '/recipes',
    },
    {
      href: '/profile',
      icon: <User size={24} />, // Profil
      label: 'Profil',
      isActive: pathname === '/profile',
    },
  ]

  if (!user) {
    return null
  }

  return (
    <>
      {/* Spacer, damit Content nicht hinter der Navigation verschwindet */}
      <div className="h-20" />
      {/* Bottom Navigation - modern, mit prominentem Hinzufügen-Button */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
          <div className="grid grid-cols-5 h-20 max-w-screen-2xl mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 relative
                  transition-all duration-200 active:scale-95
                  ${item.isActive ? 'text-emerald-600' : 'text-gray-500'}
                  ${item.label === 'Hinzufügen' ? 'transform -translate-y-2' : ''}
                `}
              >
                {/* Spezielles Styling für Hinzufügen-Button */}
                {item.label === 'Hinzufügen' ? (
                  <div className={`
                    p-3 rounded-full shadow-lg
                    bg-gradient-to-r from-emerald-500 to-purple-600
                    text-white
                    ${item.isActive ? 'scale-110' : ''}
                    transition-transform duration-200
                  `}>
                    {item.icon}
                  </div>
                ) : (
                  <div className={`
                    p-2 rounded-xl transition-all duration-200
                    ${item.isActive ? 'bg-emerald-50 text-emerald-600' : ''}
                  `}>
                    {item.icon}
                  </div>
                )}
                <span className={`
                  text-xs font-medium
                  ${item.label === 'Hinzufügen' ? 'mt-1' : ''}
                `}>
                  {item.label}
                </span>
                {/* Aktiver Indikator */}
                {item.isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                )}
              </Link>
            ))}
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
