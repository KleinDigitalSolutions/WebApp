'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuthStore()
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-white">
      <main className="h-full w-full">
        {children}
      </main>
    </div>
  )
}
