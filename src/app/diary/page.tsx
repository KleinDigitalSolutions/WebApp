'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, DiaryEntry } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { 
  Plus, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Edit,
  Clock
} from 'lucide-react'

export default function DiaryPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEntries()
  }, [user, selectedDate])

  const loadEntries = async () => {
    if (!user) return

    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const { data } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: false })

      if (data) {
        setEntries(data)
      }
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const deleteEntry = async (entryId: string) => {
    try {
      await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)
      
      setEntries(entries.filter(entry => entry.id !== entryId))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const groupedEntries = entries.reduce((groups, entry) => {
    const mealType = entry.meal_type
    if (!groups[mealType]) {
      groups[mealType] = []
    }
    groups[mealType].push(entry)
    return groups
  }, {} as Record<string, DiaryEntry[]>)

  const mealTypes = [
    { key: 'breakfast', label: 'Frühstück', icon: '🌅' },
    { key: 'lunch', label: 'Mittagessen', icon: '☀️' },
    { key: 'dinner', label: 'Abendessen', icon: '🌙' },
    { key: 'snack', label: 'Snacks', icon: '🍎' }
  ]

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Ernährungstagebuch</h1>
            <button 
              onClick={() => router.push('/diary/add')}
              className="p-2 bg-emerald-500 text-white rounded-full transition-colors active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => changeDate('prev')}
              className="p-2 rounded-full transition-colors active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">
                {selectedDate.toLocaleDateString('de-DE', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>
            
            <button 
              onClick={() => changeDate('next')}
              className="p-2 rounded-full transition-colors active:scale-95"
              disabled={selectedDate.toDateString() === new Date().toDateString()}
            >
              <ChevronRight className={`h-5 w-5 ${
                selectedDate.toDateString() === new Date().toDateString() 
                  ? 'text-gray-300' 
                  : 'text-gray-600'
              }`} />
            </button>
          </div>

          {/* Daily Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">{totalCalories}</span>
                <span className="text-sm text-gray-600 ml-1">kcal</span>
              </div>
              <div className="text-sm text-gray-600">
                {entries.length} Einträge
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {mealTypes.map((mealType) => {
              const mealEntries = groupedEntries[mealType.key] || []
              const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0)

              return (
                <div key={mealType.key} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                  {/* Meal Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{mealType.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{mealType.label}</h3>
                          <p className="text-sm text-gray-600">{mealCalories} kcal</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/diary/add?meal=${mealType.key}`)}
                        className="p-2 bg-emerald-500 text-white rounded-xl transition-colors active:scale-95"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Meal Entries */}
                  <div className="p-6">
                    {mealEntries.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Keine Einträge für {mealType.label.toLowerCase()}</p>
                        <button 
                          onClick={() => router.push(`/diary/add?meal=${mealType.key}`)}
                          className="mt-3 text-emerald-600 font-medium text-sm"
                        >
                          Erstes Lebensmittel hinzufügen
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mealEntries.map((entry) => (
                          <div 
                            key={entry.id} 
                            className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{entry.food_name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-700 mt-1">
                                <span className="font-medium">{entry.quantity}{entry.unit}</span>
                                <span className="font-medium text-emerald-600">{entry.calories} kcal</span>
                                <div className="flex items-center text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(entry.created_at).toLocaleTimeString('de-DE', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                              
                              {/* Nutrition Info */}
                              <div className="flex items-center space-x-3 text-xs text-gray-600 mt-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">P: {entry.protein_g}g</span>
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">K: {entry.carb_g}g</span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">F: {entry.fat_g}g</span>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => router.push(`/diary/edit/${entry.id}`)}
                                className="p-2 bg-blue-500 text-white rounded-xl transition-colors active:scale-95"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteEntry(entry.id)}
                                className="p-2 bg-red-500 text-white rounded-xl transition-colors active:scale-95"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
