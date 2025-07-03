'use client'

import { useState, useCallback } from 'react'
import SwipeableCards from './SwipeableCards'
import ActiveChallenges from './ActiveChallenges'

export default function ChallengeSection() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleChallengeStarted = useCallback(() => {
    // Trigger a refresh of both components
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const handleChallengeAborted = useCallback(() => {
    // Trigger a refresh of both components when challenge is aborted
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return (
    <>
      {/* Swipeable Cards */}
      <SwipeableCards key={`swipe-${refreshTrigger}`} onChallengeStarted={handleChallengeStarted} />

      {/* Active Challenges */}
      <ActiveChallenges key={`active-${refreshTrigger}`} onChallengeAborted={handleChallengeAborted} />
    </>
  )
}