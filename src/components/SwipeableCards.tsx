'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Load user's challenges
  useEffect(() => {
    if (!user?.id) {
      return
    }

    const loadChallenges = async () => {
      try {
        const { data } = await supabase
          .from('abstinence_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (data) {
          setChallenges(data)
          
          // Map cards with challenge data
          const cardsWithProgress = swipeCards.map(card => {
            const challenge = data.find(c => c.challenge_type === card.id && c.is_active)
            return {
              ...card,
              challenge,
              streakDays: challenge?.current_streak_days || 0
            }
          })
          
          // Show only cards without active challenges
          const availableCards = cardsWithProgress.filter(card => !card.challenge)
          console.log('Available cards after filtering:', availableCards)
          setCards(availableCards)
        } else {
          setCards(swipeCards)
        }
      } catch (error) {
        console.error('Error loading challenges:', error)
        setCards(swipeCards)
      }
    }

    loadChallenges()
  }, [user?.id])

  const startChallenge = async (card: SwipeCard) => {
    if (!user?.id) return false

    try {
      console.log('Starting challenge for:', card.title)
      
      // Check if challenge already exists
      const existingChallenge = challenges.find(c => c.challenge_type === card.id && c.is_active)
      if (existingChallenge) {
        console.log('Challenge already exists:', existingChallenge)
        alert('Diese Challenge ist bereits aktiv!')
        return false
      }
      
      const insertData = {
        user_id: user.id,
        challenge_type: card.id,
        challenge_name: card.title,
        start_date: new Date().toISOString(),
        current_streak_days: 0,
        longest_streak_days: 0,
        total_attempts: 1,
        target_days: 30,
        status: 'active',
        is_active: true
      }

      console.log('Insert data:', insertData)

      const { data, error } = await supabase
        .from('abstinence_challenges')
        .insert(insertData)
        .select()
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Error starting challenge:', error)
        alert('Fehler beim Erstellen der Challenge: ' + error.message)
        return false
      }

      if (data) {
        console.log('Challenge created successfully:', data)
        setChallenges(prev => [...prev, data])
        
        // Notify parent component that a challenge was started
        if (onChallengeStarted) {
          onChallengeStarted()
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error starting challenge:', error)
      alert('Unerwarteter Fehler: ' + error)
      return false
    }
  }

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (index !== currentIndex) return
    setIsDragging(true)
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (!isDragging || index !== currentIndex) return
    
    const deltaX = e.touches[0].clientX - dragStart.x
    const deltaY = e.touches[0].clientY - dragStart.y
    
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = (index: number) => {
    if (!isDragging || index !== currentIndex) return
    
    const threshold = 100
    const { x } = dragOffset

    if (Math.abs(x) > threshold) {
      // Card swiped away
      const direction = x > 0 ? 'right' : 'left'
      animateCardOut(direction)
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 })
    }
    
    setIsDragging(false)
  }

  const animateCardOut = async (direction: 'left' | 'right') => {
    const card = cardRefs.current[currentIndex]
    const currentCard = cards[currentIndex]
    if (!card || !currentCard) return

    const translateX = direction === 'right' ? '150%' : '-150%'
    card.style.transform = `translateX(${translateX}) rotate(${direction === 'right' ? '30deg' : '-30deg'})`
    card.style.opacity = '0'

    // If swiped right (yes), start the challenge
    let challengeStarted = false
    if (direction === 'right') {
      challengeStarted = await startChallenge(currentCard)
    }

    setTimeout(() => {
      // Only remove card if challenge was successfully started or if swiped left
      if (direction === 'left' || challengeStarted) {
        setCards(prev => prev.filter((_, i) => i !== currentIndex))
        if (currentIndex >= cards.length - 1) {
          setCurrentIndex(0)
        }
      } else {
        // Reset card position if challenge failed
        card.style.transform = 'translateX(0) rotate(0deg)'
        card.style.opacity = '1'
      }
      setDragOffset({ x: 0, y: 0 })
    }, 300)
  }

  const resetCards = () => {
    setCards(swipeCards)
    setCurrentIndex(0)
    setDragOffset({ x: 0, y: 0 })
  }

  const getCardStyle = (index: number) => {
    const isTopCard = index === currentIndex
    const offset = index - currentIndex

    if (isTopCard && isDragging) {
      const rotation = dragOffset.x * 0.1
      return {
        transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
        zIndex: 10,
        scale: 1
      }
    }

    return {
      transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.05})`,
      zIndex: 10 - offset,
      opacity: offset > 2 ? 0 : 1 - offset * 0.2
    }
  }

  if (cards.length === 0) {
    return (
      <div className="bg-emerald-100/80 rounded-3xl p-6 shadow-lg border border-emerald-200/60">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alle Karten abgearbeitet! 🎉</h3>
          <button
            onClick={resetCards}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Neu starten
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-3xl border border-white/30 shadow-2xl p-6 bg-transparent" style={{background:'transparent', boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.18)'}}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Verzicht-Challenge</h3>
        <div className="text-sm text-white/80">
          {cards.length} von {swipeCards.length} übrig
        </div>
      </div>
      <div
        className="relative h-64 flex items-center justify-center"
        style={{ touchAction: 'pan-x' }}
      >
        {cards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            ref={el => { cardRefs.current[index] = el }}
            className={`absolute w-48 h-56 bg-white/30 rounded-2xl shadow-lg border border-white/20 cursor-grab active:cursor-grabbing transition-all duration-300 ease-out backdrop-blur-xl`}
            style={getCardStyle(index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={(e) => handleTouchMove(e, index)}
            onTouchEnd={() => handleTouchEnd(index)}
            onMouseDown={(e) => {
              if (index !== currentIndex) return
              setIsDragging(true)
              setDragStart({ x: e.clientX, y: e.clientY })
            }}
            onMouseMove={(e) => {
              if (!isDragging || index !== currentIndex) return
              const deltaX = e.clientX - dragStart.x
              const deltaY = e.clientY - dragStart.y
              setDragOffset({ x: deltaX, y: deltaY })
            }}
            onMouseUp={() => handleTouchEnd(index)}
            onMouseLeave={() => {
              if (isDragging && index === currentIndex) {
                handleTouchEnd(index)
              }
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className={`${card.color} mb-4`}>{card.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{card.title}</h4>
              <p className="text-sm text-white/80">{card.description}</p>
            </div>
            {/* Swipe indicators */}
            {index === currentIndex && (
              <>
                <div 
                  className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 transition-opacity"
                  style={{ opacity: dragOffset.x > 50 ? 1 : 0 }}
                >
                  ✓ JA
                </div>
                <div 
                  className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold opacity-0 transition-opacity"
                  style={{ opacity: dragOffset.x < -50 ? 1 : 0 }}
                >
                  ✗ NEIN
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-xs text-white/70 mb-3">
          Swipe nach rechts = Ja, ich verzichte | Swipe nach links = Nein, nicht heute
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => animateCardOut('left')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            ✗ Nein
          </button>
          <button
            onClick={() => animateCardOut('right')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
          >
            ✓ Ja
          </button>
        </div>
      </div>
    </div>
  )
}