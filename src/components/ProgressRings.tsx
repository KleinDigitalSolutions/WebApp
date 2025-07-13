import { motion } from 'framer-motion'
import { useActivityStore } from '@/store'

export const ProgressRings = () => {
  const { activities } = useActivityStore()

  // Berechne die Fortschritte
  const caloriesProgress = Math.min((activities.reduce((sum, a) => sum + a.calories, 0) / 2000) * 100, 100)
  const durationProgress = Math.min((activities.reduce((sum, a) => sum + a.duration_min, 0) / 60) * 100, 100)
  const activitiesProgress = Math.min((activities.length / 3) * 100, 100)

  return (
    <div className="grid grid-cols-3 gap-4">
      <ProgressRing value={caloriesProgress} label="Kalorien" color="orange" />
      <ProgressRing value={durationProgress} label="Dauer" color="blue" />
      <ProgressRing value={activitiesProgress} label="Aktivitäten" color="emerald" />
    </div>
  )
}

const ProgressRing = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (value / 100) * circumference

  const colorClasses = {
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    emerald: 'text-emerald-500'
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-neutral-200"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className={colorClasses[color as keyof typeof colorClasses]}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-neutral-800">
            {Math.round(value)}%
          </span>
        </div>
      </motion.div>
      <span className="mt-2 text-sm font-medium text-neutral-600">{label}</span>
    </div>
  )
} 