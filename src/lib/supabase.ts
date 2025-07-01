import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility to get the correct site URL for redirects
export const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 
         (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
}

// Database Types
export interface Profile {
  id: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  height_cm?: number
  weight_kg?: number
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle'
  created_at?: string
  updated_at?: string
}

export interface DiaryEntry {
  id: string
  user_id: string
  food_name: string
  quantity: number
  unit: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  protein_g: number
  carb_g: number
  fat_g: number
  entry_date: string
  created_at: string
}

export interface Recipe {
  id: string
  user_id?: string
  title: string
  image_url?: string
  ingredients: { name: string; amount: string }[]
  instructions: string
  nutrition_info: { 
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    [key: string]: unknown;
  }
  is_public: boolean
  created_at: string
}
