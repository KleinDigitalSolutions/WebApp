import React, { useEffect, useState } from 'react'
import { supabase, DiaryEntry, UserActivity, FastingSession, AbstinenceChallenge } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { FaInfoCircle } from 'react-icons/fa'
import Modal from '@/components/Modal'
import CaloriesIntakeDetail from './CaloriesIntakeDetail'
import CaloriesBurnedDetail from './CaloriesBurnedDetail'
import FastingDetail from './FastingDetail'
import ChallengesDetail from './ChallengesDetail'

const PERIODS = [
  { key: 'day', label: 'Heute' },
  { key: '7days', label: '7 Tage' },
  { key: 'month', label: 'Monat' },
  { key: 'year', label: 'Jahr' },
]

interface OverviewStats {
  totalCalories: number
  totalBurned: number
  fastingCount: number
  fastingHours: number
  challengeCount: number
  challengeCompleted: number
}

function getRange(period: string) {
  const now = new Date()
  let start: Date
  if (period === 'day') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === '7days') {
    start = new Date(now)
    start.setDate(now.getDate() - 6)
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (period === 'year') {
    start = new Date(now.getFullYear(), 0, 1)
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  }
}

export default function DashboardOverviewSwiper() {
  const { user } = useAuthStore()
  const [periodIdx, setPeriodIdx] = useState(2) // default: Monat
  const [stats, setStats] = useState<Record<string, OverviewStats>>({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'calories' | 'burned' | 'fasting' | 'challenges'>(null)

  useEffect(() => {
    if (!user) return
    async function fetchAll() {
      if (!user) return // zusätzlicher Check für TypeScript
      setLoading(true)
      const result: Record<string, OverviewStats> = {}
      for (const p of PERIODS) {
        const { start, end } = getRange(p.key)
        // Diary
        const { data: diary } = await supabase
          .from('diary_entries')
          .select('calories')
          .eq('user_id', user.id)
          .gte('created_at', `${start}T00:00:00`)
          .lte('created_at', `${end}T23:59:59`)
        // Activities
        const { data: activities } = await supabase
          .from('user_activities')
          .select('calories')
          .eq('user_id', user.id)
          .gte('created_at', `${start}T00:00:00`)
          .lte('created_at', `${end}T23:59:59`)
        // Fasting
        const { data: fasting } = await supabase
          .from('fasting_sessions')
          .select('start_time, end_time')
          .eq('user_id', user.id)
          .gte('start_time', `${start}T00:00:00`)
          .lte('start_time', `${end}T23:59:59`)
        // Challenges
        const { data: challenges } = await supabase
          .from('abstinence_challenges')
          .select('status')
          .eq('user_id', user.id)
          .gte('created_at', `${start}T00:00:00`)
          .lte('created_at', `${end}T23:59:59`)
        result[p.key] = {
          totalCalories: (diary as DiaryEntry[] | null)?.reduce((sum, e) => sum + (e.calories || 0), 0) || 0,
          totalBurned: (activities as UserActivity[] | null)?.reduce((sum, a) => sum + (a.calories || 0), 0) || 0,
          fastingCount: (fasting as FastingSession[] | null)?.length || 0,
          fastingHours: (fasting as FastingSession[] | null)?.reduce((sum, f) => {
            if (f.end_time && f.start_time) {
              return sum + (new Date(f.end_time).getTime() - new Date(f.start_time).getTime()) / 1000 / 60 / 60
            }
            return sum
          }, 0) || 0,
          challengeCount: (challenges as AbstinenceChallenge[] | null)?.length || 0,
          challengeCompleted: (challenges as AbstinenceChallenge[] | null)?.filter(c => c.status === 'completed').length || 0,
        }
      }
      setStats(result)
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const activePeriod = PERIODS[periodIdx].key
  const activeStats = stats[activePeriod]

  // Touch/Swipe-Handler
  let touchStartX = 0
  let touchEndX = 0
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX = e.changedTouches[0].screenX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX = e.changedTouches[0].screenX
    if (touchEndX - touchStartX > 50 && periodIdx > 0) setPeriodIdx(periodIdx - 1)
    if (touchStartX - touchEndX > 50 && periodIdx < PERIODS.length - 1) setPeriodIdx(periodIdx + 1)
  }

  if (!user) return null
  if (loading || !activeStats) return <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-4 text-gray-600">Lade Übersicht...</div>

  // Wenn ein Modal offen ist, Swiper ausblenden (damit keine Karte "darunter" sichtbar ist)
  if (modal) {
    return (
      <>
        {modal === 'calories' && (
          <Modal open={true} onClose={() => setModal(null)} title="Details Kalorienaufnahme">
            {user && (
              <CaloriesIntakeDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
            )}
          </Modal>
        )}
        {modal === 'burned' && (
          <Modal open={true} onClose={() => setModal(null)} title="Details Kalorienverbrauch">
            {user && (
              <CaloriesBurnedDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
            )}
          </Modal>
        )}
        {modal === 'fasting' && (
          <Modal open={true} onClose={() => setModal(null)} title="Details Fasten">
            {user && (
              <FastingDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
            )}
          </Modal>
        )}
        {modal === 'challenges' && (
          <Modal open={true} onClose={() => setModal(null)} title="Details Challenges">
            {user && (
              <ChallengesDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
            )}
          </Modal>
        )}
      </>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-4 text-gray-800 select-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{PERIODS[periodIdx].label} Übersicht</h3>
        <div className="flex gap-1">
          {PERIODS.map((p, i) => (
            <button key={p.key} className={`w-2 h-2 rounded-full ${i===periodIdx?'bg-emerald-500':'bg-gray-300'}`} onClick={()=>setPeriodIdx(i)} aria-label={p.label} />
          ))}
        </div>
      </div>
      <div className="mb-3 text-gray-600 text-xs flex items-center gap-2">
        <FaInfoCircle className="text-emerald-600" /> Tippe oder wische für andere Zeiträume.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button onClick={() => setModal('calories')} className="text-left">
          <div className="text-2xl font-bold text-gray-800">{activeStats.totalCalories} kcal</div>
          <div className="text-xs text-gray-600">Aufgenommen</div>
        </button>
        <button onClick={() => setModal('burned')} className="text-left">
          <div className="text-2xl font-bold text-gray-800">{activeStats.totalBurned} kcal</div>
          <div className="text-xs text-gray-600">Verbrannt (Aktivitäten)</div>
        </button>
        <button onClick={() => setModal('fasting')} className="text-left">
          <div className="text-2xl font-bold text-gray-800">{activeStats.fastingCount}</div>
          <div className="text-xs text-gray-600">Fasten-Sessions</div>
        </button>
        <button onClick={() => setModal('fasting')} className="text-left">
          <div className="text-2xl font-bold text-gray-800">{activeStats.fastingHours.toFixed(1)} h</div>
          <div className="text-xs text-gray-600">Gefastet</div>
        </button>
        <button onClick={() => setModal('challenges')} className="text-left">
          <div className="text-2xl font-bold text-gray-800">{activeStats.challengeCount}</div>
          <div className="text-xs text-gray-600">Challenges</div>
        </button>
        <button onClick={() => setModal('challenges')} className="text-left">
          <div className="text-2xl font-bold text-gray-800">{activeStats.challengeCompleted}</div>
          <div className="text-xs text-gray-600">Abgeschlossen</div>
        </button>
      </div>
    </div>
  )
}
