import { useState, useEffect } from 'react'
import { Salad, QrCode, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react'

const steps = [
  {
    title: 'Willkommen bei TrackFood!',
    text: 'Deine smarte Ernährungs-App für Gesundheit, Fitness & Genuss. Starte jetzt durch!',
    icon: <BookOpen className="w-12 h-12 text-emerald-500 mb-4" />,
  },
  {
    title: 'Ernährungstagebuch',
    text: 'Logge deine Mahlzeiten & Nährwerte – einfach, schnell und mobil.',
    icon: <BookOpen className="w-12 h-12 text-emerald-500 mb-4" />,
  },
  {
    title: 'KI-Chat',
    text: 'Stelle dem KI-Chat deine Ernährungsfragen und erhalte sofort smarte, persönliche Analysen & Tipps!'
      + ' Die KI erkennt Muster, gibt Empfehlungen und motiviert dich – alles auf Deutsch.',
    icon: <img src="/SVG/gesicht.svg" alt="KI Gesicht" className="w-12 h-12 mb-4" />,
  },
  {
    title: 'Barcode-Scanner',
    text: 'Scanne Produkte & erhalte sofort Nährwerte aus der deutschen Datenbank.',
    icon: <QrCode className="w-12 h-12 text-emerald-500 mb-4" />,
  },
  {
    title: 'Rezepte entdecken',
    text: 'Finde gesunde Rezepte & übernimm sie direkt in dein Tagebuch.',
    icon: <Salad className="w-12 h-12 text-emerald-500 mb-4" />,
  },
  {
    title: 'Datenschutz garantiert',
    text: 'Deine Daten sind sicher & privat – DSGVO-konform & verschlüsselt.',
    icon: <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />,
  },
]

export default function OnboardingModal({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center animate-fadeIn relative">
        {steps[step].icon}
        <h2 className="text-2xl font-bold text-emerald-700 mb-2 text-center">{steps[step].title}</h2>
        <p className="text-gray-700 text-center mb-6">{steps[step].text}</p>
        <div className="flex gap-2 w-full">
          {step < steps.length - 1 && (
            <button
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-lg shadow-md hover:bg-emerald-600 transition"
              onClick={() => setStep(s => s + 1)}
            >
              Weiter <ArrowRight className="inline ml-1 w-5 h-5" />
            </button>
          )}
          {step === steps.length - 1 && (
            <button
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-lg shadow-md hover:bg-emerald-700 transition"
              onClick={onFinish}
            >
              Los geht&apos;s!
            </button>
          )}
          <button
            className="ml-2 py-3 px-4 rounded-xl bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition"
            onClick={onFinish}
          >
            Überspringen
          </button>
        </div>
        <div className="flex gap-1 mt-6 justify-center">
          {steps.map((_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i === step ? 'bg-emerald-500' : 'bg-gray-200'}`}></span>
          ))}
        </div>
      </div>
    </div>
  )
}
