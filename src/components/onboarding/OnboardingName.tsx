'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OnboardingName() {
  const { currentStep, setCurrentStep, firstName, setFirstName, lastName, setLastName } = useOnboardingStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const local = getOnboardingData()
    if (local.firstName) setFirstName(local.firstName)
    if (local.lastName) setLastName(local.lastName)
  }, [setFirstName, setLastName])

  useEffect(() => {
    saveOnboardingData({
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
    })
  }, [firstName, lastName])

  const handleNext = () => {
    if (!firstName || !lastName) {
      setError('Bitte gib Vor- und Nachnamen an.')
      return
    }
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
          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 pb-12 sm:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 leading-tight"
          variants={itemVariants}
        >
          Wie heißt du?
        </motion.h1>

        {/* Input Vorname */}
        <motion.div className="w-full max-w-sm mb-4" variants={itemVariants}>
          <div className="relative">
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-200 text-lg text-gray-800 placeholder-gray-400 shadow-sm"
              placeholder="Vorname"
              value={firstName || ''}
              onChange={e => setFirstName(e.target.value)}
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </motion.div>

        {/* Input Nachname */}
        <motion.div className="w-full max-w-sm mb-8" variants={itemVariants}>
          <div className="relative">
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-200 text-lg text-gray-800 placeholder-gray-400 shadow-sm"
              placeholder="Nachname"
              value={lastName || ''}
              onChange={e => setLastName(e.target.value)}
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
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
        <motion.button
          onClick={handleNext}
          disabled={!firstName || !lastName}
          className={`w-full max-w-sm py-4 rounded-2xl font-bold text-white text-lg transition-all transform duration-300 ease-in-out
            ${
              !firstName || !lastName
                ? 'bg-gray-300 cursor-not-allowed scale-[0.98]'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.97] shadow-lg hover:shadow-xl'
            }
            flex items-center justify-center space-x-2`}
          variants={itemVariants}
        >
          <span>Weiter</span>
          {!(!firstName || !lastName) && (
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              →
            </motion.div>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}
