'use client'

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/store'
import { getOnboardingData, saveOnboardingData } from '@/lib/onboarding-storage'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const DIET_OPTIONS = [
	{ key: 'standard', label: 'Standard', emoji: '🥩' },
	{ key: 'vegan', label: 'Vegan', emoji: '🥑' },
	{ key: 'vegetarian', label: 'Vegetarisch', emoji: '🥦' },
	{ key: 'keto', label: 'Keto', emoji: '🍣' },
	{ key: 'other', label: 'Andere', emoji: '🍽️' },
]

export default function OnboardingDietType() {
	const { currentStep, setCurrentStep, dietType, setDietType } = useOnboardingStore()
	const [selected, setSelected] = useState<string | null>(dietType || null)
	const [isGlutenfree, setIsGlutenfree] = useState<boolean>(false)

	useEffect(() => {
		const local = getOnboardingData()
		if (local.dietType) setSelected(local.dietType)
		if (typeof local.isGlutenfree === 'boolean') setIsGlutenfree(local.isGlutenfree)
	}, [])

	useEffect(() => {
		setDietType(selected)
		saveOnboardingData({ dietType: selected ?? undefined, isGlutenfree })
	}, [selected, setDietType, isGlutenfree])

	const handleNext = () => {
		if (!selected) return
		setCurrentStep(currentStep + 1)
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				duration: 0.5,
				ease: 'easeOut' as const,
			},
		},
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: { y: 0, opacity: 1 },
	}

	const buttonVariants = {
		initial: { scale: 1 },
		selected: {
			scale: 1.05,
			boxShadow: '0 10px 20px rgba(16,185,129,0.10)',
			transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
		},
		unselected: {
			scale: 1,
			boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
			transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
		},
		hover: { scale: 1.02, boxShadow: '0 6px 12px rgba(16,185,129,0.08)' },
		tap: { scale: 0.98 },
	}

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
			{/* Header mit Zurück-Button */}
			<div className="px-6 py-6 sm:px-8 sm:py-8">
				<motion.button
					onClick={() => setCurrentStep(currentStep - 1)}
					className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
					whileTap={{ scale: 0.95 }}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
					aria-label="Zurück"
				>
					<ArrowLeft className="w-6 h-6 text-gray-600" />
				</motion.button>
			</div>

			{/* Hauptinhalt mit Animationen */}
			<motion.div
				className="flex-1 flex flex-col items-center justify-start px-6 pb-12 sm:px-8"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.h1
					className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 leading-tight"
					variants={itemVariants}
				>
					Was sind deine Ernährungspräferenzen?
				</motion.h1>

				{/* Grid für die Ernährungsoptionen */}
				<motion.div
					className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8"
					variants={containerVariants}
					role="radiogroup"
					aria-label="Ernährungspräferenz auswählen"
				>
					{DIET_OPTIONS.map(opt => (
						<motion.button
							key={opt.key}
							onClick={() => setSelected(opt.key)}
							className={`flex flex-col items-center justify-center rounded-2xl border-2 transition-all p-6 h-36 text-lg font-semibold cursor-pointer
                ${selected === opt.key
									? 'border-emerald-500 bg-emerald-50 text-emerald-800'
									: 'border-gray-200 bg-white text-gray-800'
								}`}
							aria-checked={selected === opt.key}
							role="radio"
							type="button"
							variants={buttonVariants}
							initial="initial"
							animate={selected === opt.key ? "selected" : "unselected"}
							whileHover="hover"
							whileTap="tap"
							tabIndex={0}
							onKeyDown={e => {
								if (e.key === ' ' || e.key === 'Enter') {
									e.preventDefault();
									setSelected(opt.key);
								}
							}}
							aria-label={opt.label}
						>
							<span className="text-4xl sm:text-5xl mb-2 leading-none">{opt.emoji}</span>
							<span className="text-base sm:text-lg font-medium text-center">{opt.label}</span>
						</motion.button>
					))}
				</motion.div>
				{/* Glutenfrei Checkbox */}
				<motion.div
            className="flex items-center w-full max-w-lg mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all duration-200"
            onClick={() => setIsGlutenfree(!isGlutenfree)}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            role="checkbox"
            aria-checked={isGlutenfree}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsGlutenfree(!isGlutenfree);
              }
            }}
        >
            <input
                id="glutenfree"
                type="checkbox"
                checked={isGlutenfree}
                onChange={e => setIsGlutenfree(e.target.checked)}
                className="w-6 h-6 text-emerald-600 border-gray-300 rounded-lg focus:ring-emerald-500 flex-shrink-0"
                style={{ transform: 'scale(1.2)' }}
                tabIndex={-1}
                aria-hidden="true"
            />
            <label htmlFor="glutenfree" className="ml-4 text-xl font-medium text-gray-800 flex items-center gap-3 flex-grow cursor-pointer">
                <span className="text-3xl leading-none">🌾</span> Glutenfrei
            </label>
        </motion.div>

				{/* Weiter-Button */}
				<motion.button
					onClick={handleNext}
					disabled={!selected}
					className={`w-full max-w-sm py-4 rounded-2xl font-bold text-white text-lg transition-all transform duration-300 ease-in-out
            ${!selected
							? 'bg-gray-300 cursor-not-allowed scale-[0.98]'
							: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.97] shadow-lg hover:shadow-xl'
						}
            flex items-center justify-center space-x-2`}
					variants={itemVariants}
					aria-label="Weiter"
				>
					<span>Weiter</span>
					{selected && (
						<motion.div
							animate={{ x: [0, 5, 0] }}
							transition={{
								repeat: Infinity,
								duration: 1.5,
								ease: 'easeInOut',
							}}
							aria-hidden
						>
							→
						</motion.div>
					)}
				</motion.button>
			</motion.div>
		</div>
	)
}
