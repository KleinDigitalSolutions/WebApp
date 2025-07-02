import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export createClient function for client-side usage
export { createClient }

// Utility to get the correct site URL for redirects
export const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 
         (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
}

// Database Types
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
  intolerances?: string[] // NEU: Unverträglichkeiten
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

// User-Generated Products System Types
export interface Product {
  id: string
  code: string
  name: string
  brand: string
  category: 'dairy' | 'meat' | 'bakery' | 'frozen' | 'beverages' | 'fruits' | 'vegetables' | 'snacks' | 'pantry'
  supermarkets: string[]
  price_min?: number
  price_max?: number
  image_url?: string
  
  // Nutrition per 100g
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  salt_per_100g?: number
  
  allergens: string[]
  keywords: string[]
  
  // User and verification
  created_by?: string
  is_verified: boolean
  is_community_product: boolean
  verification_status: 'pending' | 'approved' | 'rejected'
  moderator_notes?: string
  verified_by?: string
  
  created_at: string
  updated_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  rating: number // 1-5
  review_text?: string
  is_nutrition_accurate?: boolean
  created_at: string
}

export interface ProductReport {
  id: string
  product_id: string
  user_id: string
  report_type: 'incorrect_nutrition' | 'wrong_name' | 'wrong_brand' | 'spam' | 'other'
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  resolved_by?: string
  resolved_at?: string
  created_at: string
}
