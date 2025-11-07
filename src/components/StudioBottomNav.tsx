'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, BookOpen, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/studio', label: 'Studio', icon: Video },
  { href: '/diary', label: 'Tagebuch', icon: BookOpen },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/profile', label: 'Profil', icon: User },
];

const StudioBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 bg-opacity-80 backdrop-blur-lg border-t border-gray-700 flex justify-around items-center z-50 shadow-2xl shadow-black">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.label} className="relative flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors duration-300 w-1/5 h-full">
            <item.icon className={`h-7 w-7 mb-1 transition-transform duration-300 ${isActive ? 'text-brand-500' : ''}`} />
            <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute bottom-1 w-10 h-1 bg-brand-500 rounded-full"
                style={{ borderRadius: '9999px' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default StudioBottomNav;
