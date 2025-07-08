'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useOnboardingStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react' // Nicht im Bild, aber nützlich für Back-Button, lasse ich erstmal drin
import { getOnboardingData, clearOnboardingData } from '@/lib/onboarding-storage'
import { motion, AnimatePresence } from 'framer-motion'
import { Apple, Activity, Flag, Calendar, Smile } from 'lucide-react' // Icons
import ConfettiExplosion from 'react-confetti-explosion'; // Import für Konfetti-Explosion

export default function OnboardingSummary() {
  const router = useRouter()
  const { user, setProfile } = useAuthStore()
  const { weight, targetWeight, setCurrentStep } = useOnboardingStore() // setCurrentStep hinzugefügt
  
  const [isLoading, setIsLoading] = useState(false)
  const [targetDateLabel, setTargetDateLabel] = useState('In 4 Wochen') // Label für das Diagramm
  const [animateDiagram, setAnimateDiagram] = useState(false)
  const [isExploding, setIsExploding] = useState(false); // Für Konfetti-Explosion
  const [kcalDaily, setKcalDaily] = useState(2246); // Dynamische kcal
  const [bmiValue, setBmiValue] = useState(26.6); // Dynamischer BMI
  const [bmiDescription, setBmiDescription] = useState('Hoch'); // Dynamische BMI-Beschreibung

  // Ref für die SVG-Breite, um die Pfade responsiv zu machen
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  // Berechnung des Zieldatums für das Diagramm-Label
  useEffect(() => {
    if (weight && targetWeight) {
      const weightToLose = weight - targetWeight;
      // Realistische Annahme: 0.5-1kg Gewichtsverlust pro Woche ist gesund
      const lossPerWeek = Math.min(1, Math.max(0.5, weightToLose / 10)); // Min 0.5, Max 1kg pro Woche
      const weeksNeeded = Math.max(4, Math.ceil(weightToLose / lossPerWeek)); // Mindestens 4 Wochen wie im Bild
      
      const targetDateObj = new Date();
      targetDateObj.setDate(targetDateObj.getDate() + (weeksNeeded * 7));
      
      const formattedDate = targetDateObj.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      });
      setTargetDateLabel(`In ${weeksNeeded} Wochen`);
      // Optional: setze kcal und BMI basierend auf realistischen Werten oder Berechnungen
      // Für diese Demo bleiben sie fix, aber hier könnte die Logik rein
    }
  }, [weight, targetWeight]);

  // Animationen starten
  useEffect(() => {
    // Animationen immer sauber zurücksetzen, damit sie bei jedem Betreten neu starten
    setAnimateDiagram(false);
    setIsExploding(false);

    // Startet die Konfetti-Explosion nach kurzer Verzögerung
    const confettiTimeout = setTimeout(() => setIsExploding(true), 300);
    // Startet die Diagramm-Animation nach Konfetti
    const diagramTimeout = setTimeout(() => setAnimateDiagram(true), 800);

    // SVG Container Breite ermitteln für responsive Pfade
    const handleResize = () => {
      if (svgContainerRef.current) {
        setSvgWidth(svgContainerRef.current.clientWidth);
      }
    };
    handleResize(); // Initial setzen
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimeout);
      clearTimeout(diagramTimeout);
    };
  }, []);

  // Dynamische Berechnung von kcal, BMI und BMI-Text
  useEffect(() => {
    let height = 0;
    let weightValue = 0;
    // Hole Werte aus localStorage oder Zustand
    const local = getOnboardingData();
    const store = useOnboardingStore.getState();
    height = local.height || store.height || 0;
    weightValue = local.weight || store.weight || 0;

    // BMI-Berechnung
    if (height > 0 && weightValue > 0) {
      const bmi = weightValue / Math.pow(height / 100, 2);
      setBmiValue(Number(bmi.toFixed(1)));
      let desc = 'Normal';
      if (bmi < 18.5) desc = 'Untergewichtig';
      else if (bmi < 25) desc = 'Normal';
      else if (bmi < 30) desc = 'Hoch';
      else desc = 'Sehr hoch';
      setBmiDescription(desc);
    }

    // Kcal-Berechnung (Mifflin-St.Jeor, grob, ohne Aktivitätsfaktor)
    let kcal = 0;
    let age = local.age || store.age || 30;
    let gender = local.gender || store.gender || 'male';
    if (height > 0 && weightValue > 0 && age > 0) {
      if (gender === 'female' || gender === 'w' || gender === 'f') {
        kcal = 10 * weightValue + 6.25 * height - 5 * age - 161;
      } else {
        kcal = 10 * weightValue + 6.25 * height - 5 * age + 5;
      }
      // Leichtes Defizit für Abnehmen
      kcal = Math.round(kcal * 1.4 - 300);
      setKcalDaily(kcal);
    }
  }, [weight, targetWeight]);

  // Back-Button Logik
  const handleBack = () => {
    setCurrentStep(4); // Geht zum Zielgewicht-Schritt zurück
    router.push('/onboarding'); // Oder entsprechende Route, falls die Schritte separat sind
  }

  // Onboarding abschließen Logik
  const handleComplete = async () => {
    if (!user) {
      console.warn("User not logged in, cannot complete onboarding.");
      router.push('/login'); // Oder zur Login-Seite umleiten
      return;
    }
    setIsLoading(true);
    try {
      const local = getOnboardingData();
      const store = useOnboardingStore.getState();

      const profileData = {
        first_name: local.firstName || store.firstName || '',
        last_name: local.lastName || store.lastName || '',
        gender: local.gender || store.gender || '',
        age: local.age || store.age || null,
        height_cm: local.height || store.height || null,
        weight_kg: local.weight || store.weight || null,
        target_weight_kg: local.targetWeight || store.targetWeight || null,
        goals: local.userGoals || store.userGoals || [],
        activity_level: local.activityLevel || 'lightly_active',
        goal: local.goal || 'lose_weight', // Hier sollte die Logik aus dem Originalcode
        onboarding_completed: true,
        onboarding_step: 8 // Finaler Schritt
      };

      // Bestimme das Ziel basierend auf Gewicht und Zielgewicht
      if (profileData.weight_kg && profileData.target_weight_kg) {
          if (profileData.weight_kg > profileData.target_weight_kg) {
              profileData.goal = 'lose_weight';
          } else if (profileData.weight_kg < profileData.target_weight_kg) {
              profileData.goal = 'gain_weight';
          } else {
              profileData.goal = 'maintain_weight';
          }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setProfile(data[0]);
      }
      clearOnboardingData(); // Lokale Daten nach Abschluss löschen
      router.push('/dashboard'); // Zum Dashboard weiterleiten
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Fehler beim Speichern des Profils. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Hilfsfunktion zur Skalierung von Werten für das SVG-Diagramm
  const scaleWeightToSvgY = (
    weightValue: number,
    minWeight: number,
    maxWeight: number,
    svgHeight: number
  ) => {
    const normalizedWeight = (weightValue - minWeight) / (maxWeight - minWeight);
    return svgHeight - (normalizedWeight * svgHeight);
  };
  
  // Da wir keine echten min/max Gewichte haben, nutzen wir relative Positionierung für die Demo
  // Die Kurve im Bild geht von einer hohen Startposition zu einer niedrigeren Endposition.
  // Nehmen wir an, die SVG-Höhe ist 200px.
  // Start-Y für Gewicht (Jetzt): Repräsentiert das aktuelle, höhere Gewicht.
  // End-Y für Gewicht (In 4 Wochen): Repräsentiert das niedrigere Zielgewicht.
  // Diese Werte müssen feinabgestimmt werden, um die visuelle Kurve des Bildes zu treffen.
  const svgViewBoxHeight = 200; // Beispiel ViewBox Höhe
  const startWeightY = 80; // Beispiel: "Jetzt" ist höher (niedrigerer Y-Wert im SVG)
  const endWeightY = 120; // Beispiel: "In 4 Wochen" ist niedriger (höherer Y-Wert im SVG)

  // Pfad für die Gewichtskurve (grün) - basierend auf dem Bild
  // Der Pfad wird responsiv gemacht, indem wir die svgWidth nutzen.
  const generateWeightPath = (width: number) => {
    if (!width) return "";
    const startX = 20; // Startpunkt X
    const endX = width - 20; // Endpunkt X
    // Kontrollpunkte anpassen, um die Kurvenform des Bildes zu imitieren
    const cp1x = startX + (endX - startX) * 0.25;
    const cp1y = startWeightY - 30; // Krümmung nach oben
    const cp2x = startX + (endX - startX) * 0.75;
    const cp2y = endWeightY - 10; // Leichte Krümmung vor dem Ende
    return `M ${startX},${startWeightY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endWeightY}`;
  };

  // Pfad für das Kaloriendefizit (blau gestrichelt) - basierend auf dem Bild
  // Diese Kurve startet niedriger und steigt dann an.
  const generateCaloriePath = (width: number) => {
    if (!width) return "";
    const startX = 20;
    const endX = width - 20;
    const startY = 150; // Niedrigerer Startpunkt
    const endY = 50;  // Höherer Endpunkt
    const cp1x = startX + (endX - startX) * 0.3;
    const cp1y = startY + 20; // Krümmung nach unten
    const cp2x = startX + (endX - startX) * 0.7;
    const cp2y = endY + 20; // Krümmung nach unten vor dem Ende
    return `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <div className="relative flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-8">
        {/* Konfetti-Explosion */}
        {isExploding && (
          <ConfettiExplosion
            particleCount={150}
            duration={2500}
            width={1000}
            height={1000}
            colors={['#FFD700', '#FF6347', '#4682B4', '#32CD32', '#9370DB']} // Farben an das Bild anpassen
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        )}

        {/* Konfetti-Grafik (statt des simplen SVG) - dies ist ein Platzhalter, idealerweise ein komplexeres, animiertes Lottie-File oder GIF */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6 mt-4 flex items-center justify-center"
        >
          <Smile className="w-20 h-20 text-emerald-400 drop-shadow-lg" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-3xl font-extrabold text-center mb-2 leading-tight">Dein Plan ist fertig!</h1>
        <p className="text-gray-500 text-center mb-8 text-base tracking-wide">
          Geschätzter Fortschritt nach <span className="font-semibold">{targetDateLabel.split(' ')[1]}</span>
        </p>

        {/* Statistik-Karten */}
        <div className="w-full flex justify-around gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-xl flex-1 shadow-sm border border-gray-100"
          >
            <Apple className="text-green-500 mb-2" size={28} strokeWidth={2} />
            <span className="text-xl font-bold text-gray-800">{kcalDaily} Kcal</span>
            <span className="text-sm text-gray-500">Täglich</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-xl flex-1 shadow-sm border border-gray-100"
          >
            {/* Hier ein BMI Icon, z.B. aus Heroicons oder angepasstes SVG */}
            <svg className="mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4" className="text-blue-500"/>
              <path d="M12 11v9m-4-4h8m-2-6l2 2m-2-2l-2 2" className="text-blue-500"/>
            </svg>
            <span className="text-xl font-bold text-gray-800">BMI: {bmiValue}</span>
            <span className="text-sm text-gray-500">({bmiDescription})</span>
          </motion.div>
        </div>

        {/* Animiertes Liniendiagramm */}
        <div ref={svgContainerRef} className="w-full bg-white rounded-3xl p-6 mb-8 relative"
             style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
          <div className="aspect-[1.5/1] w-full relative"> {/* Angepasstes Aspect Ratio für das Diagramm */}
            <svg className="w-full h-full" viewBox={`0 0 ${svgWidth > 0 ? svgWidth : 300} ${svgViewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
              {/* Gestrichelte vertikale Linien (optional, können auch nur die Labels sein) */}
              <line x1="20" y1="20" x2="20" y2="180" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={svgWidth - 20} y1="20" x2={svgWidth - 20} y2="180" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Gradient für den Füllbereich unter der Gewichtskurve */}
              <defs>
                <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                </linearGradient>
                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
                </linearGradient>
              </defs>

              {/* Füllbereich unter der Gewichtskurve */}
              {animateDiagram && (
                <motion.path
                  d={`${generateWeightPath(svgWidth)} L ${svgWidth - 20},${svgViewBoxHeight - 20} L 20,${svgViewBoxHeight - 20} Z`} // Pfad schließen für Füllung
                  fill="url(#weightGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                />
              )}

              {/* Gewichtskurve (grün) */}
              <motion.path
                d={generateWeightPath(svgWidth)}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: animateDiagram ? 1 : 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />

              {/* Kaloriendefizit-Kurve (blau gestrichelt) */}
              <motion.path
                d={generateCaloriePath(svgWidth)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="8 8" // Längere Striche und Lücken
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: animateDiagram ? 1 : 0 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />

              {/* Dots für "Jetzt" und "In 4 Wochen" auf der Gewichtskurve */}
              <motion.circle
                cx="20" cy={startWeightY} r="6"
                fill="#10b981"
                stroke="#fff" strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: animateDiagram ? 1 : 0 }}
                transition={{ delay: 1.6, duration: 0.3, type: 'spring' }}
              />
              <motion.circle
                cx={svgWidth - 20} cy={endWeightY} r="6"
                fill="#10b981"
                stroke="#fff" strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: animateDiagram ? 1 : 0 }}
                transition={{ delay: 1.6, duration: 0.3, type: 'spring' }}
              />

              {/* Labels für die Kurve */}
              <text x="20" y={svgViewBoxHeight - 10} textAnchor="middle" fontSize="14" fill="#666" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>Jetzt</text>
              <text x={svgWidth - 20} y={svgViewBoxHeight - 10} textAnchor="middle" fontSize="14" fill="#666" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{targetDateLabel}</text>
              
              {/* Optional: Label auf den Kurven selbst (wie im Bild) */}
              {/* <text x={svgWidth / 2} y={startWeightY - 20} textAnchor="middle" fontSize="14" fill="#10b981" style={{ fontFamily: 'var(--font-sans), sans-serif', fontWeight: 'bold' }}>Gewicht</text>
              <text x={svgWidth / 2} y={endY - 20} textAnchor="middle" fontSize="14" fill="#3b82f6" style={{ fontFamily: 'var(--font-sans), sans-serif', fontWeight: 'bold' }}>Kalorien</text> */}

            </svg>
          </div>
        </div>

        {/* Zusätzliche Informationen unter dem Diagramm */}
        <div className="w-full flex justify-around gap-6 mb-8 text-gray-600 font-medium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Calendar size={20} className="text-gray-500" />
            <span>{targetDateLabel.split(' ')[1]}</span> {/* Zeigt nur "4 Wochen" */}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Flag size={20} className="text-gray-500" />
            <span>Gewichtsverlust</span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-lg text-gray-600 text-center mb-10 leading-relaxed"
        >
          Viele unserer Nutzer sehen bereits nach {targetDateLabel.replace('In ', '').toLowerCase()} sichtbare Ergebnisse.
        </motion.p>

        {/* Weiter-Button */}
        <div className="w-full mt-auto mb-4">
          <motion.button
            onClick={handleComplete}
            disabled={isLoading}
            className={`w-full py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 ease-in-out transform
              ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'}
              flex items-center justify-center`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wird eingerichtet...
              </span>
            ) : "Weiter"}
          </motion.button>
        </div>
      </div>
    </div>
  )
}