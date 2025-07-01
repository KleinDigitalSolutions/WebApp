import { create } from 'zustand'
import { Profile, DiaryEntry } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

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
