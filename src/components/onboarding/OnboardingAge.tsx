'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OnboardingAge() {
  const { currentStep, setCurrentStep, setAge } = useOnboardingStore()
  const [localAge, setLocalAge] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const local = getOnboardingData()
    if (typeof local.age === 'number' && !isNaN(local.age)) setLocalAge(local.age)
  }, [])

  useEffect(() => {
    if (typeof localAge === 'number') {
      saveOnboardingData({ age: localAge })
    }
  }, [localAge])

  const handleNext = () => {
    if (typeof localAge !== 'number' || localAge < 13 || localAge > 120) {
      setError('Bitte gib ein gültiges Alter zwischen 13 und 120 an.')
      return
    }
    setAge(localAge)
    setError(null)
    setCurrentStep(currentStep + 1)
  }

  // Framer Motion Varianten
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      },
    },
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <motion.button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="p-2 rounded-full transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-12 sm:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-center mb-8 leading-tight"
          variants={itemVariants}
        >
          Wie alt bist du?
        </motion.h1>

        {/* Alter Eingabefeld mit Slider-Optik */}
        <motion.div className="w-full max-w-xs mb-8 relative" variants={itemVariants}>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-200 text-center text-4xl font-bold text-gray-800 placeholder-gray-400 shadow-sm appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            type="number"
            min={13}
            max={120}
            value={localAge}
            onChange={e => setLocalAge(e.target.value ? parseInt(e.target.value) : '')}
            placeholder="Alter"
            aria-label="Dein Alter"
          />
          <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500 pointer-events-none">Jahre</span>
        </motion.div>

        {/* Fehlermeldung */}
        {error && (
          <motion.div
            className="mb-6 text-red-500 text-base font-medium flex items-center justify-center space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Weiter-Button */}
        <button
          onClick={handleNext}
          disabled={typeof localAge !== 'number' || localAge < 13 || localAge > 120}
          className={`w-full py-4 rounded-full font-semibold text-white bg-emerald-500 ${typeof localAge !== 'number' || localAge < 13 || localAge > 120 ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-disabled={typeof localAge !== 'number' || localAge < 13 || localAge > 120}
        >
          Weiter
        </button>
      </motion.div>
    </div>
  )
}
