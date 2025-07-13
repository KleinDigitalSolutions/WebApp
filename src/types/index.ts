export interface Profile {
  id: string
  first_name?: string
  last_name?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  height_cm?: number
  weight_kg?: number
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle'
  created_at?: string
  updated_at?: string
  intolerances?: string[]
  show_onboarding?: boolean
  
  target_weight_kg?: number
  birth_date?: string
  goals?: string[]
  onboarding_completed?: boolean
  onboarding_step?: number
  diet_type?: string
  is_glutenfree?: boolean
} 