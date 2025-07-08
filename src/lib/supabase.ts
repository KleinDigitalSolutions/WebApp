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
  show_onboarding?: boolean // Onboarding-Modal nach Login anzeigen
  
  // Neue Onboarding-Felder
  target_weight_kg?: number
  birth_date?: string
  goals?: string[]
  onboarding_completed?: boolean
  onboarding_step?: number
  diet_type?: string // Ernährungspräferenz
  is_glutenfree?: boolean // Glutenfrei als Zusatzpräferenz
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
  fiber_g: number // NEU: Ballaststoffe
  sugar_g: number // NEU: Zucker
  sodium_mg: number // NEU: Natrium
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

export interface FastingSession {
  id: string
  user_id: string
  plan: string
  start_time: string
  end_time: string | null
  is_active: boolean
  target_duration_hours: number
  status: 'active' | 'completed' | 'cancelled'
  fasting_type: 'intermittent_16_8' | 'intermittent_18_6' | 'intermittent_20_4' | 'custom'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AbstinenceChallenge {
  id: string
  user_id: string
  challenge_type: 'no_cigarettes' | 'no_chips' | 'no_chocolate' | 'no_sugar' | 'no_fastfood' | 'no_coffee' | 'no_alcohol'
  challenge_name: string
  start_date: string
  last_reset_date: string | null
  current_streak_days: number
  longest_streak_days: number
  total_attempts: number
  is_active: boolean
  status: 'active' | 'paused' | 'completed' | 'failed'
  target_days: number
  reward_message: string | null
  created_at: string
  updated_at: string
}

export interface AbstinenceLog {
  id: string
  challenge_id: string
  user_id: string
  log_date: string
  success: boolean
  notes: string | null
  mood_rating: number | null
  created_at: string
}

// User Activity Tracking
export interface UserActivity {
  id: string
  user_id: string
  activity_id: string
  activity_name: string
  emoji?: string
  met: number
  duration_min: number
  weight_kg: number
  calories: number
  note?: string
  activity_date: string
  created_at: string
}
