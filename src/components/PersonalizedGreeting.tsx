'use client'

import { useEffect, useState } from 'react'

export const PersonalizedGreeting = () => {
  const [greeting, setGreeting] = useState('')
  const name = 'Özgur'

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Guten Morgen')
    else if (hour < 18) setGreeting('Guten Tag')
    else setGreeting('Guten Abend')
  }, [])

  return (
    <div>
      <h1 className="text-[#000000] text-2xl font-bold">
        {greeting}, {name}! 👋
      </h1>
      <p className="text-[#666666] mt-1">
        Lass uns deinen Tag tracken
      </p>
    </div>
  )
} 