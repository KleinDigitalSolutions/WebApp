'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, Plus, Calendar, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import AddItemModal from './AddItemModal' // Wir erstellen diese Komponente als Nächstes

const NewBottomNav = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/nutrition', label: 'Ernährung', icon: BookOpen },
    { href: '/courses', label: 'Kurse', icon: Calendar },
    { href: '/profile', label: 'Profil', icon: UserIcon },
  ]

  const handleNavClick = (href: string) => {
    router.push(href)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 flex items-center justify-around z-50 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.2)]">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="flex flex-col items-center justify-center text-gray-400 transition-colors duration-200 ease-in-out"
            >
              <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-emerald-400' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Central Add Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center -mt-8 shadow-lg shadow-emerald-500/40 transform transition-transform hover:scale-110 active:scale-95"
        >
          <Plus className="h-8 w-8" />
        </button>

        {navItems.slice(2, 4).map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="flex flex-col items-center justify-center text-gray-400 transition-colors duration-200 ease-in-out"
            >
              <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-emerald-400' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default NewBottomNav
