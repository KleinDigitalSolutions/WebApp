import React, { useEffect, useState } from 'react'
import { supabase, DiaryEntry, UserActivity, FastingSession, AbstinenceChallenge } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import Modal from '@/components/Modal'
import CaloriesIntakeDetail from './CaloriesIntakeDetail'
import CaloriesBurnedDetail from './CaloriesBurnedDetail'
import FastingDetail from './FastingDetail'
import ChallengesDetail from './ChallengesDetail'
import { FaInfoCircle } from 'react-icons/fa'

interface MonthlyStats {
  totalCalories: number
  totalBurned: number
  fastingCount: number
  fastingHours: number
  challengeCount: number
  challengeCompleted: number
}

function getMonthRange(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export default function MonthlyOverviewCard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MonthlyStats | null>(null)
  const [modal, setModal] = useState<null | 'calories' | 'burned' | 'fasting' | 'challenges'>(null)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)
      const { start, end } = getMonthRange()
      // Diary entries
      const { data: diary } = await supabase
        .from('diary_entries')
        .select('calories')
        .eq('user_id', user.id)
        .gte('created_at', `${start}T00:00:00`)
        .lt('created_at', `${end}T00:00:00`)
      // Activities
      const { data: activities } = await supabase
        .from('user_activities')
        .select('calories')
        .eq('user_id', user.id)
        .gte('created_at', `${start}T00:00:00`)
        .lt('created_at', `${end}T00:00:00`)
      // Fasting
      const { data: fasting } = await supabase
        .from('fasting_sessions')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', `${start}T00:00:00`)
        .lt('start_time', `${end}T00:00:00`)
      // Challenges
      const { data: challenges } = await supabase
        .from('abstinence_challenges')
        .select('status')
        .eq('user_id', user.id)
        .gte('created_at', `${start}T00:00:00`)
        .lt('created_at', `${end}T00:00:00`)
      // Stats
      setStats({
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
      })
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (!user) return null
  if (loading) return <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-4 text-gray-600">Lade Monatsübersicht...</div>

  return (
    <>
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mb-4 text-gray-800">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Monatsübersicht</h3>
        <div className="mb-3 text-gray-600 text-xs flex items-center gap-2">
          <FaInfoCircle className="text-emerald-600" /> Tippe auf einen Bereich für mehr Details.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={() => setModal('calories')} className="text-left">
            <div className="text-2xl font-bold text-gray-800">{stats?.totalCalories} kcal</div>
            <div className="text-xs text-gray-600">Aufgenommen</div>
          </button>
          <button onClick={() => setModal('burned')} className="text-left">
            <div className="text-2xl font-bold text-gray-800">{stats?.totalBurned} kcal</div>
            <div className="text-xs text-gray-600">Verbrannt (Aktivitäten)</div>
          </button>
          <button onClick={() => setModal('fasting')} className="text-left">
            <div className="text-2xl font-bold text-gray-800">{stats?.fastingCount}</div>
            <div className="text-xs text-gray-600">Fasten-Sessions</div>
          </button>
          <button onClick={() => setModal('fasting')} className="text-left">
            <div className="text-2xl font-bold text-gray-800">{stats?.fastingHours.toFixed(1)} h</div>
            <div className="text-xs text-gray-600">Gefastet</div>
          </button>
          <button onClick={() => setModal('challenges')} className="text-left">
            <div className="text-2xl font-bold text-gray-800">{stats?.challengeCount}</div>
            <div className="text-xs text-gray-600">Challenges</div>
          </button>
          <button onClick={() => setModal('challenges')} className="text-left">
            <div className="text-2xl font-bold text-gray-800">{stats?.challengeCompleted}</div>
            <div className="text-xs text-gray-600">Abgeschlossen</div>
          </button>
        </div>
        <div className="flex justify-end mt-2">
          <a href="/dashboard/monthly-details" className="text-xs text-emerald-600 underline hover:text-emerald-700 transition">Alle Monatsdetails anzeigen →</a>
        </div>
      </div>
      {/* Modals */}
      <Modal open={modal === 'calories'} onClose={() => setModal(null)} title="Details Kalorienaufnahme">
        {user && (
          <CaloriesIntakeDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
        )}
      </Modal>
      <Modal open={modal === 'burned'} onClose={() => setModal(null)} title="Details Kalorienverbrauch">
        {user && (
          <CaloriesBurnedDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
        )}
      </Modal>
      <Modal open={modal === 'fasting'} onClose={() => setModal(null)} title="Details Fasten">
        {user && (
          <FastingDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
        )}
      </Modal>
      <Modal open={modal === 'challenges'} onClose={() => setModal(null)} title="Details Challenges">
        {user && (
          <ChallengesDetail userId={user.id} month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
        )}
      </Modal>
    </>
  )
}
