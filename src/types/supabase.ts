export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          duration_minutes: number
          calories_burned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          duration_minutes: number
          calories_burned: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          duration_minutes?: number
          calories_burned?: number
          created_at?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          user_id: string
          food_name: string
          calories: number
          protein_g: number
          carb_g: number
          fat_g: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          calories: number
          protein_g: number
          carb_g: number
          fat_g: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          calories?: number
          protein_g?: number
          carb_g?: number
          fat_g?: number
          created_at?: string
        }
      }
      water_intake: {
        Row: {
          id: string
          user_id: string
          amount_ml: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_ml: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_ml?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 