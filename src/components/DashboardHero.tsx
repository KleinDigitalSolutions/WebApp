'use client'

import { motion } from 'framer-motion'
import { PersonalizedGreeting } from './PersonalizedGreeting'
import { AIDailyInsight } from './AIDailyInsight'
import { QuickActions } from './QuickActions'
import { ProgressRings } from './ProgressRings'

export const DashboardHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 bg-[#ffffff]"
    >
      {/* Greeting Section */}
      <div className="px-4 py-6">
        <PersonalizedGreeting />
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <QuickActions />
      </div>
      
      {/* AI Insight Card */}
      <div className="px-4 mb-6">
        <AIDailyInsight />
      </div>
      
      {/* Progress Overview */}
      <div className="px-4 mb-6">
        <h2 className="text-[#000000] text-xl font-semibold mb-4">
          Dein Tagesüberblick
        </h2>
        <ProgressRings />
      </div>
    </motion.div>
  )
} 