'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  BookOpen, 
  ChefHat, 
  User,
  PlusCircle 
} from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

export function MobileBottomNav() {
  const pathname = usePathname()

  // Don't show bottom nav on auth pages or landing page
  if (pathname === '/' || pathname.includes('/login') || pathname.includes('/register')) {
    return null
  }

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      icon: <Home size={24} />,
      label: 'Start',
      isActive: pathname === '/dashboard'
    },
    {
      href: '/diary',
      icon: <BookOpen size={24} />,
      label: 'Tagebuch',
      isActive: pathname === '/diary'
    },
    {
      href: '/diary/add',
      icon: <PlusCircle size={28} />,
      label: 'Hinzufügen',
      isActive: pathname === '/diary/add'
    },
    {
      href: '/recipes',
      icon: <ChefHat size={24} />,
      label: 'Rezepte',
      isActive: pathname === '/recipes'
    },
    {
      href: '/profile',
      icon: <User size={24} />,
      label: 'Profil',
      isActive: pathname === '/profile'
    }
  ]

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
          <div className="grid grid-cols-5 h-20">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 relative
                  transition-all duration-200 active:scale-95
                  ${item.isActive 
                    ? 'text-emerald-600' 
                    : 'text-gray-500'
                  }
                  ${item.label === 'Hinzufügen' 
                    ? 'transform -translate-y-2' 
                    : ''
                  }
                `}
              >
                {/* Special styling for the add button */}
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
                    ${item.isActive 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : ''
                    }
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
                
                {/* Active indicator */}
                {item.isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
