'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft, User, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { ModernInput, ModernButton } from '@/components/ui/ModernComponents'
import { AnimatePresence } from 'framer-motion'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Progress Bar */}
      <motion.div 
        className="w-full bg-secondary-200 h-1"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-1"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / 9) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </motion.div>

      {/* Header */}
      <motion.div 
        className="px-6 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-6 h-6 text-secondary-600" />
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-start px-6 pt-8 pb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Icon */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/25 mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <User className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-center mb-8 leading-tight text-secondary-900"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Wie heißt du?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-secondary-600 text-center mb-8 max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Lass uns mit deinem Namen beginnen. Das hilft uns, deine Erfahrung zu personalisieren.
        </motion.p>

        {/* Input Vorname */}
        <motion.div 
          className="w-full max-w-sm mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <ModernInput
            label="Vorname"
            placeholder="Dein Vorname"
            value={firstName || ''}
            onChange={setFirstName}
            icon={<User className="w-5 h-5" />}
          />
        </motion.div>

        {/* Input Nachname */}
        <motion.div 
          className="w-full max-w-sm mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <ModernInput
            label="Nachname"
            placeholder="Dein Nachname"
            value={lastName || ''}
            onChange={setLastName}
            icon={<User className="w-5 h-5" />}
          />
        </motion.div>

        {/* Fehlermeldung */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 text-accent-error text-base font-medium flex items-center justify-center space-x-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-accent-error" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weiter-Button */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <ModernButton
            onClick={handleNext}
            disabled={!firstName || !lastName}
            size="lg"
            className="w-full"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Weiter
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  )
}
