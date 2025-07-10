'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Home, BookOpen, ChefHat, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Modern NavItems mit Lucide-Icons
  const navItems = [
    {
      href: '/dashboard',
      icon: <Home size={24} />,
      label: 'Start',
      isActive: pathname === '/dashboard',
    },
    {
      href: '/diary',
      icon: <BookOpen size={24} />,
      label: 'Tagebuch',
      isActive: pathname === '/diary',
    },
    {
      href: '/chat',
      icon: <Sparkles size={28} />,
      label: 'KI Berater',
      isActive: pathname === '/chat',
    },
    {
      href: '/recipes',
      icon: <ChefHat size={24} />,
      label: 'Rezepte',
      isActive: pathname === '/recipes',
    },
    {
      href: '/profile',
      icon: <User size={24} />,
      label: 'Profil',
      isActive: pathname === '/profile',
    },
  ]

  if (!user) {
    return null
  }

  return (
    <>
      {/* Modern Bottom Navigation with Glassmorphism */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-2xl shadow-black/10">
          <div className="grid grid-cols-5 h-20 max-w-screen-2xl mx-auto px-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 relative
                  transition-all duration-300 active:scale-95
                  ${item.isActive ? 'text-primary-600' : 'text-secondary-500'}
                `}
              >
                <motion.div 
                  className={`
                    p-3 rounded-2xl transition-all duration-300 relative
                    ${item.isActive ? 'bg-primary-50 text-primary-600' : 'hover:bg-secondary-50'}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  {item.icon}
                  {/* Active indicator with animation */}
                  {item.isActive && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"
                      layoutId="activeIndicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
                <motion.span 
                  className={`
                    text-xs font-medium transition-colors duration-300
                    ${item.isActive ? 'text-primary-600' : 'text-secondary-600'}
                  `}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Modern Mobile Menu for User Actions */}
      <div className="lg:hidden">
        {/* Floating User Menu Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-xl hover:bg-white text-secondary-600 hover:text-secondary-800 p-3 rounded-2xl shadow-lg border border-white/20 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="sr-only">User menu</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </motion.button>

        {/* Modern Mobile User Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="fixed top-16 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 min-w-48"
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-sm text-secondary-600 mb-3 pb-3 border-b border-secondary-200 truncate">
                  {user.email}
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-accent-error hover:text-red-800 py-2 rounded-xl hover:bg-red-50 transition-colors duration-200"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Abmelden
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
