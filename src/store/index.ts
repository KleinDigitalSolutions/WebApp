import { create } from 'zustand'
import { Profile, DiaryEntry, UserActivity } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthState {
  user: User | null
  profile: Profile | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  logout: () => set({ user: null, profile: null }),
}))

interface DiaryState {
  entries: DiaryEntry[]
  selectedDate: string
  dailyGoals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  setEntries: (entries: DiaryEntry[]) => void
  addEntry: (entry: DiaryEntry) => void
  removeEntry: (id: string) => void
  setSelectedDate: (date: string) => void
  setDailyGoals: (goals: { calories: number; protein: number; carbs: number; fat: number }) => void
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: [],
  selectedDate: new Date().toISOString().split('T')[0],
  dailyGoals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  },
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  removeEntry: (id) => set((state) => ({ entries: state.entries.filter(e => e.id !== id) })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setDailyGoals: (goals) => set({ dailyGoals: goals }),
}))

interface UIState {
  isLoading: boolean
  sidebarOpen: boolean
  setLoading: (loading: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  sidebarOpen: false,
  setLoading: (loading) => set({ isLoading: loading }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

interface OnboardingState {
  currentStep: number
  totalSteps: number
  userGoals: string[]
  height: number
  weight: number
  targetWeight: number
  birthDate: string | null
  firstName: string | null
  lastName: string | null
  age: number | null
  gender: string | null
  dietType: string | null
  setCurrentStep: (step: number) => void
  setUserGoals: (goals: string[]) => void
  setHeight: (height: number) => void
  setWeight: (weight: number) => void
  setTargetWeight: (weight: number) => void
  setBirthDate: (date: string | null) => void
  setFirstName: (name: string) => void
  setLastName: (name: string) => void
  setAge: (age: number) => void
  setGender: (gender: string) => void
  setDietType: (diet: string | null) => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  totalSteps: 8,
  userGoals: [],
  height: 170,
  weight: 70,
  targetWeight: 70,
  birthDate: null,
  firstName: '',
  lastName: '',
  age: null,
  gender: '',
  dietType: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setUserGoals: (goals) => set({ userGoals: goals }),
  setHeight: (height) => set({ height }),
  setWeight: (weight) => set({ weight }),
  setTargetWeight: (weight) => set({ targetWeight: weight }),
  setBirthDate: (date) => set({ birthDate: date }),
  setFirstName: (name) => set({ firstName: name }),
  setLastName: (name) => set({ lastName: name }),
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setDietType: (diet) => set({ dietType: diet }),
  resetOnboarding: () => set({ 
    currentStep: 1,
    userGoals: [],
    height: 170,
    weight: 70,
    targetWeight: 70,
    birthDate: null,
    firstName: '',
    lastName: '',
    age: null,
    gender: '',
    dietType: null
  }),
}))

interface WaterState {
  waterIntake: number
  waterGoal: number
  isLoading: boolean
  addWater: (amount: number) => Promise<void>
  setWaterGoal: (goal: number) => Promise<void>
  resetWater: () => Promise<void>
  fetchWaterData: (date?: string) => Promise<void>
}

export const useWaterStore = create<WaterState>((set, get) => ({
  waterIntake: 0,
  waterGoal: 2000,
  isLoading: false,

  fetchWaterData: async (date?: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/water${date ? `?date=${date}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch water data')
      const data = await response.json()
      set({ 
        waterIntake: data.amount_ml,
        waterGoal: data.daily_goal_ml,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching water data:', error)
      set({ isLoading: false })
    }
  },

  addWater: async (amount: number) => {
    const { waterIntake, waterGoal } = get()
    const newAmount = Math.max(0, waterIntake + amount)
    
    try {
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_ml: newAmount,
          daily_goal_ml: waterGoal
        })
      })
      
      if (!response.ok) throw new Error('Failed to update water intake')
      const data = await response.json()
      set({ waterIntake: data.amount_ml })
    } catch (error) {
      console.error('Error updating water intake:', error)
      // Optimistic update rückgängig machen
      set({ waterIntake })
    }
  },

  setWaterGoal: async (goal: number) => {
    const { waterIntake } = get()
    const newGoal = Math.max(0, goal)
    
    try {
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_ml: waterIntake,
          daily_goal_ml: newGoal
        })
      })
      
      if (!response.ok) throw new Error('Failed to update water goal')
      const data = await response.json()
      set({ waterGoal: data.daily_goal_ml })
    } catch (error) {
      console.error('Error updating water goal:', error)
    }
  },

  resetWater: async () => {
    try {
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_ml: 0,
          daily_goal_ml: get().waterGoal
        })
      })
      
      if (!response.ok) throw new Error('Failed to reset water intake')
      const data = await response.json()
      set({ waterIntake: data.amount_ml })
    } catch (error) {
      console.error('Error resetting water intake:', error)
    }
  }
}))

interface ActivityState {
  activities: UserActivity[]
  isLoading: boolean
  selectedDate: string
  addActivity: (activity: Omit<UserActivity, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  removeActivity: (id: string) => Promise<void>
  fetchActivities: (date?: string) => Promise<void>
  setSelectedDate: (date: string) => void
  updateActivity: (activityId: string, updates: Partial<UserActivity>) => void
  fetchWeeklyActivities: () => Promise<void>
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  selectedDate: new Date().toISOString().split('T')[0],

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchActivities: async (date?: string) => {
    const targetDate = date || get().selectedDate
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('activity_date', targetDate)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ activities: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching activities:', error)
      set({ isLoading: false })
    }
  },

  fetchWeeklyActivities: async () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6) // 7 Tage inkl. heute
    
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .lte('activity_date', endDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true })

      if (error) throw error
      set({ activities: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching weekly activities:', error)
      set({ isLoading: false })
    }
  },

  addActivity: async (activity) => {
    const { activities } = get()
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert([{
          ...activity,
          activity_date: get().selectedDate
        }])
        .select()
        .single()

      if (error) throw error
      set({ activities: [data, ...activities] })
    } catch (error) {
      console.error('Error adding activity:', error)
    }
  },

  removeActivity: async (id) => {
    const { activities } = get()
    try {
      const { error } = await supabase
        .from('user_activities')
        .delete()
        .eq('id', id)

      if (error) throw error
      set({ activities: activities.filter(a => a.id !== id) })
    } catch (error) {
      console.error('Error removing activity:', error)
    }
  },

  updateActivity: (activityId, updates) => {
    set((state) => ({
      activities: state.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...updates } : activity
      )
    }))
  }
}))

interface Insight {
  title: string
  message: string
  type: 'nutrition' | 'activity' | 'motivation'
  timestamp: number
}

interface InsightCache {
  [key: string]: Insight
}

interface InsightState {
  currentInsight: Insight | null
  cache: InsightCache
  isLoading: boolean
  error: string | null
  lastFetchTimestamp: number
  fetchInsight: () => Promise<void>
  clearCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 Minuten
const RATE_LIMIT_DURATION = 30 * 1000 // 30 Sekunden

export const useInsightStore = create<InsightState>((set, get) => ({
  currentInsight: null,
  cache: {},
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  fetchInsight: async () => {
    const now = Date.now()
    const { lastFetchTimestamp, cache } = get()

    // Rate Limiting prüfen
    if (now - lastFetchTimestamp < RATE_LIMIT_DURATION) {
      const waitTime = Math.ceil((RATE_LIMIT_DURATION - (now - lastFetchTimestamp)) / 1000)
      set({ error: `Bitte warte noch ${waitTime} Sekunden` })
      return
    }

    // Cache-Key aus aktuellen Daten generieren
    const { profile } = useAuthStore.getState()
    const { entries } = useDiaryStore.getState()
    const { waterIntake } = useWaterStore.getState()
    const { activities } = useActivityStore.getState()

    const cacheKey = JSON.stringify({
      profileId: profile?.id,
      entriesCount: entries.length,
      waterIntake,
      activitiesCount: activities.length
    })

    // Prüfen, ob ein gültiger Cache-Eintrag existiert
    const cachedInsight = cache[cacheKey]
    if (cachedInsight && now - cachedInsight.timestamp < CACHE_DURATION) {
      set({ currentInsight: cachedInsight, error: null })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          entries,
          waterIntake,
          activities,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch insight')
      }

      const data = await response.json()
      const insight: Insight = {
        ...data,
        timestamp: now
      }

      // Cache aktualisieren und alte Einträge entfernen
      const newCache = { ...cache }
      Object.keys(newCache).forEach(key => {
        if (now - newCache[key].timestamp > CACHE_DURATION) {
          delete newCache[key]
        }
      })
      newCache[cacheKey] = insight

      set({
        currentInsight: insight,
        cache: newCache,
        isLoading: false,
        lastFetchTimestamp: now,
        error: null
      })
    } catch (error) {
      console.error('Error fetching insight:', error)
      set({
        isLoading: false,
        error: 'Konnte keine Empfehlung laden'
      })
    }
  },

  clearCache: () => set({ cache: {} })
}))
