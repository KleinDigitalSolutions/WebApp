'use client'

import { useState, useCallback } from 'react'
import SwipeableCards from './SwipeableCards'
import ActiveChallenges from './ActiveChallenges'

export default function ChallengeSection() {
  const [refreshActive, setRefreshActive] = useState(0)
  const [refreshCards, setRefreshCards] = useState(0)

  const handleChallengeStarted = useCallback(() => {
    // Nach Start: beide Bereiche aktualisieren
    setRefreshCards(prev => prev + 1)
    setRefreshActive(prev => prev + 1)
  }, [])

  const handleChallengeAborted = useCallback(() => {
    // Nach Abbruch: nur ActiveChallenges aktualisieren
    setRefreshActive(prev => prev + 1)
  }, [])

  return (
    <>
      {/* Swipeable Cards */}
      <SwipeableCards key={`swipe-${refreshCards}`} onChallengeStarted={handleChallengeStarted} />

      {/* Active Challenges */}
      <ActiveChallenges key={`active-${refreshActive}`} onChallengeAborted={handleChallengeAborted} />
    </>
  )
}