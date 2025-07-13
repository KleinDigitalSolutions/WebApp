'use client'

import Link from 'next/link'
import { Plus, Droplets, Activity, Apple } from 'lucide-react'

export const QuickActions = () => {
  const actions = [
    {
      icon: <Plus className="w-6 h-6 text-[#007AFF]" />,
      label: 'Eintrag',
      href: '/diary/add'
    },
    {
      icon: <Droplets className="w-6 h-6 text-[#007AFF]" />,
      label: 'Wasser',
      href: '/diary/water'
    },
    {
      icon: <Activity className="w-6 h-6 text-[#007AFF]" />,
      label: 'Aktivität',
      href: '/diary/activity'
    },
    {
      icon: <Apple className="w-6 h-6 text-[#007AFF]" />,
      label: 'Ernährung',
      href: '/diary/nutrition'
    }
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center justify-center p-3 bg-[#f8f8f8] rounded-xl"
        >
          {action.icon}
          <span className="text-[#000000] text-sm mt-1">{action.label}</span>
        </Link>
      ))}
    </div>
  )
} 