'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Cigarette, Coffee, Cookie, Candy, Pizza, Wine, Apple } from 'lucide-react'
import { supabase, AbstinenceChallenge } from '@/lib/supabase'
import { useAuthStore } from '@/store'

interface SwipeCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  challenge?: AbstinenceChallenge
  streakDays?: number
}

const swipeCards: SwipeCard[] = [
  {
    id: 'no_cigarettes',
    title: 'Keine Zigaretten',
    description: 'Rauchfrei bleiben',
    icon: <Cigarette className="h-8 w-8" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    id: 'no_chips',
    title: 'Keine Chips',
    description: 'Gesunde Snacks wählen',
    icon: <Cookie className="h-8 w-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: 'no_chocolate',
    title: 'Keine Schokolade',
    description: 'Süße Versuchungen meiden',
    icon: <Candy className="h-8 w-8" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  },
  {
    id: 'no_sugar',
    title: 'Kein Zucker',
    description: 'Zuckerfrei leben',
    icon: <Apple className="h-8 w-8" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  {
    id: 'no_fastfood',
    title: 'Kein Fast Food',
    description: 'Frisch kochen',
    icon: <Pizza className="h-8 w-8" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 'no_coffee',
    title: 'Kein Kaffee',
    description: 'Koffeinfrei bleiben',
    icon: <Coffee className="h-8 w-8" />,
    color: 'text-brown-600',
    bgColor: 'bg-stone-100'
  },
  {
    id: 'no_alcohol',
    title: 'Kein Alkohol',
    description: 'Nüchtern bleiben',
    icon: <Wine className="h-8 w-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }
]

interface SwipeableCardsProps {
  onChallengeStarted?: () => void
}

export default function SwipeableCards({ onChallengeStarted }: SwipeableCardsProps) {
  const { user } = useAuthStore()
  const [cards, setCards] = useState<SwipeCard[]>([])
  const [challenges, setChallenges] = useState<AbstinenceChallenge[]>([])
  const [selectedCard, setSelectedCard] = useState<SwipeCard | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [challengeDuration, setChallengeDuration] = useState(30)
  const [isStarting, setIsStarting] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Load user's challenges
  useEffect(() => {
    if (!user?.id) return
    const loadChallenges = async () => {
      try {
        const { data } = await supabase
          .from('abstinence_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
        if (data) {
          setChallenges(data)
          const cardsWithProgress = swipeCards.map(card => {
            const challenge = data.find(c => c.challenge_type === card.id && c.is_active)
            return {
              ...card,
              challenge,
              streakDays: challenge?.current_streak_days || 0
            }
          })
          setCards(cardsWithProgress)
        } else {
          setCards(swipeCards)
        }
      } catch {
        setCards(swipeCards)
      }
    }
    loadChallenges()
  }, [user?.id])

  const handleCardClick = (card: SwipeCard) => {
    setSelectedCard(card)
    setChallengeDuration(card.challenge?.target_days || 30)
    setShowDetail(true)
  }

  const handleStartChallenge = async () => {
    if (!user?.id || !selectedCard) return
    setIsStarting(true)
    try {
      const existingChallenge = challenges.find(c => c.challenge_type === selectedCard.id && c.is_active)
      if (existingChallenge) {
        alert('Diese Challenge ist bereits aktiv!')
        setIsStarting(false)
        return
      }
      const insertData = {
        user_id: user.id,
        challenge_type: selectedCard.id,
        challenge_name: selectedCard.title,
        start_date: new Date().toISOString(),
        current_streak_days: 0,
        longest_streak_days: 0,
        total_attempts: 1,
        target_days: challengeDuration,
        status: 'active',
        is_active: true
      }
      const { data, error } = await supabase
        .from('abstinence_challenges')
        .insert(insertData)
        .select()
        .single()
      if (error) {
        alert('Fehler beim Erstellen der Challenge: ' + error.message)
        setIsStarting(false)
        return
      }
      setChallenges(prev => [...prev, data])
      setShowDetail(false)
      setSelectedCard(null)
      if (onChallengeStarted) onChallengeStarted()
    } catch (e) {
      alert('Unerwarteter Fehler: ' + e)
    }
    setIsStarting(false)
  }

  // Scroll-Lock für Body, wenn Overlay offen
  useEffect(() => {
    if (showDetail) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showDetail]);

  // Carousel-Ansicht
  // Ref für Scroll-Container
  // const scrollContainerRef = useRef<HTMLDivElement>(null) // ENTFERNT!

  // Wheel-Handler für horizontales Scrollen auf Desktop
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Nur auf Desktop (keine Touch-Events)
        if (window.innerWidth >= 768) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div>
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto flex space-x-6 pb-4 relative" // scrollbar-hide entfernt
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Gemeinsame Wave als absolutes Hintergrund-Element entfernt */}
        {cards.map((card, idx) => {
          // Bei der letzten Karte: Wave etwas nach links verschieben, damit der Abschluss nicht sichtbar ist
          const isLast = idx === cards.length - 1;
          const bgPosX = isLast
            ? `${-1 * idx * (224 + 24) - 40}px` // 40px nach links verschieben (anpassbar)
            : `${-1 * idx * (224 + 24)}px`;
          return (
            <div
              key={card.id}
              className={
                `flex-shrink-0 w-56 h-72 rounded-2xl shadow-2xl border-0 cursor-pointer transition-transform duration-300 relative group bg-transparent`
              }
              style={{
                scrollSnapAlign: 'center',
                minWidth: '14rem',
                maxWidth: '14rem',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)',
                background: `#ffffff`,
                backgroundSize: '1568px 300px',
                backgroundPositionX: bgPosX,
                backgroundPositionY: '0px',
              } as React.CSSProperties}
              data-idx={idx}
              onClick={() => handleCardClick(card)}
            >
              {/* Hochglanz-Overlay */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none">
                {/* Unteres Glanz-Overlay entfernt, um Kante zu vermeiden */}
              </div>
              <div className="h-full flex flex-col items-center justify-center p-6 text-center relative z-10">
                <div className={`mb-4 drop-shadow-lg text-gray-700`}>{card.icon}</div>
                <h4 className="text-lg font-bold text-gray-800 drop-shadow-lg mb-2">{card.title}</h4>
                <p className="text-sm text-gray-600 drop-shadow mb-2">{card.description}</p>
                {card.challenge && (
                  <div className="mt-2 text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded-full font-semibold shadow">Aktiv: {card.challenge.current_streak_days} Tage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Detail-Overlay/Slide-in als echtes Modal/Portal */}
      {showDetail && selectedCard && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-40 flex justify-center md:items-center items-center bg-black/40 backdrop-blur-sm transition-all" onClick={() => setShowDetail(false)}>
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-0 mx-auto animate-slideInUp relative max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl z-10" onClick={()=>setShowDetail(false)}>&times;</button>
            <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-4 w-full select-none" style={{overflow:'hidden', overscrollBehavior:'none'}}>
              <div className={`${selectedCard.color} mb-4`}>{selectedCard.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedCard.title}</h4>
              <p className="text-base text-gray-700 mb-4">{selectedCard.description}</p>
              {/* Challenge-Dauer-Auswahl jetzt oben */}
              {!selectedCard.challenge && (
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wie lange möchtest du verzichten?</label>
                  <select
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={challengeDuration}
                    onChange={e => setChallengeDuration(Number(e.target.value))}
                    disabled={isStarting}
                  >
                    {[7, 14, 21, 30, 60, 90].map(d => (
                      <option key={d} value={d}>{d} Tage</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Fortschritt nur wenn Challenge aktiv */}
              {selectedCard.challenge && (
                <div className="w-full text-center mt-2">
                  <div className="text-blue-600 font-semibold mb-1">Aktiv: {selectedCard.challenge.current_streak_days} / {selectedCard.challenge.target_days} Tage</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, Math.round((selectedCard.challenge.current_streak_days/selectedCard.challenge.target_days)*100))}%`}}></div>
                  </div>
                  <div className="text-xs text-gray-500">Challenge läuft!</div>
                </div>
              )}
            </div>
            {/* Start-Button sticky am unteren Rand */}
            {!selectedCard.challenge && (
              <div className="w-full px-6 pb-6 pt-2 bg-white sticky bottom-0 z-10 rounded-b-3xl">
                <button
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60"
                  onClick={handleStartChallenge}
                  disabled={isStarting}
                >
                  {isStarting ? 'Starte...' : 'Challenge starten'}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}