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
    gender: ''
  }),
}))
