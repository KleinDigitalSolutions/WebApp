'use client'

import { motion } from 'framer-motion'
import { Flame, Footprints, PersonStanding, Zap } from 'lucide-react'

interface RingProps {
  radius: number
  strokeWidth: number
  progress: number // 0 to 100+
  gradientId: string
  gradientColors: [string, string]
  animationDelay: number
}

const Ring = ({ radius, strokeWidth, progress, gradientId, gradientColors, animationDelay }: RingProps) => {
  const circumference = 2 * Math.PI * radius
  // Erlaube Werte über 100% für den "Überfüll"-Effekt
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={gradientColors[0]} />
          <stop offset="100%" stopColor={gradientColors[1]} />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={radius}
        strokeWidth={strokeWidth}
        fill="transparent"
        className="text-gray-700/50"
      />
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        strokeWidth={strokeWidth}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: "circOut", delay: animationDelay }}
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 4px ${gradientColors[1]})` }}
      />
      {/* Überfüll-Effekt, wenn Progress > 100% */}
      {progress > 100 && (
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - ((progress - 100) / 100) * circumference }}
          transition={{ duration: 1.0, ease: "circOut", delay: animationDelay + 1.0 }}
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 5px ${gradientColors[1]})` }}
        />
      )}
    </>
  )
}

export default function AppleHealthRings() {
  // Fake data for demo
  const stepsData = { value: 6540, goal: 10000, progress: (6540 / 10000) * 100 }
  const moveData = { value: 350, goal: 500, progress: (350 / 500) * 100 }
  const exerciseData = { value: 45, goal: 30, progress: (45 / 30) * 100 } // Über 100%
  const standData = { value: 9, goal: 12, progress: (9 / 12) * 100 }

  return (
    <div className="bg-zinc-900 rounded-3xl shadow-lg border border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Tagesaktivität</h3>
      <div className="flex items-center justify-between gap-6">
        {/* Rings */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Steps Ring (New Outer) */}
            <Ring
              radius={46}
              strokeWidth={7}
              progress={stepsData.progress}
              gradientId="stepsGradient"
              gradientColors={['#facc15', '#f97316']}
              animationDelay={0.1}
            />
            {/* Move Ring */}
            <Ring
              radius={37}
              strokeWidth={7}
              progress={moveData.progress}
              gradientId="moveGradient"
              gradientColors={['#f87171', '#ef4444']}
              animationDelay={0.3}
            />
            {/* Exercise Ring */}
            <Ring
              radius={28}
              strokeWidth={7}
              progress={exerciseData.progress}
              gradientId="exerciseGradient"
              gradientColors={['#4ade80', '#22c55e']}
              animationDelay={0.5}
            />
            {/* Stand Ring */}
            <Ring
              radius={19}
              strokeWidth={7}
              progress={standData.progress}
              gradientId="standGradient"
              gradientColors={['#60a5fa', '#3b82f6']}
              animationDelay={0.7}
            />
          </svg>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Schritte</p>
              <p className="font-semibold text-white">{stepsData.value} / {stepsData.goal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Bewegung</p>
              <p className="font-semibold text-white">{moveData.value} / {moveData.goal} <span className="text-xs text-gray-500">kcal</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Training</p>
              <p className="font-semibold text-white">{exerciseData.value} / {exerciseData.goal} <span className="text-xs text-gray-500">min</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PersonStanding className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Stehen</p>
              <p className="font-semibold text-white">{standData.value} / {standData.goal} <span className="text-xs text-gray-500">Std.</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
