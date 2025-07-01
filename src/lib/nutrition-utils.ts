import { Profile } from './supabase'

// Mifflin-St Jeor Equation for BMR calculation
export function calculateBMR(profile: Profile): number {
  if (!profile.age || !profile.weight_kg || !profile.height_cm || !profile.gender) {
    return 0
  }

  const { age, weight_kg, height_cm, gender } = profile

  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  }

  return Math.round(bmr)
}

// Calculate Total Daily Energy Expenditure (TDEE)
export function calculateTDEE(profile: Profile): number {
  const bmr = calculateBMR(profile)
  if (bmr === 0) return 0

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  }

  const multiplier = activityMultipliers[profile.activity_level || 'sedentary']
  return Math.round(bmr * multiplier)
}

// Calculate daily calorie goal based on user's goal
export function calculateDailyCalorieGoal(profile: Profile): number {
  const tdee = calculateTDEE(profile)
  if (tdee === 0) return 2000 // Default fallback

  switch (profile.goal) {
    case 'lose_weight':
      return Math.round(tdee - 500) // 500 calorie deficit for ~1lb/week weight loss
    case 'gain_weight':
    case 'build_muscle':
      return Math.round(tdee + 300) // 300 calorie surplus for weight gain
    case 'maintain_weight':
    default:
      return tdee
  }
}

// Calculate macro targets based on calories and goal
export function calculateMacroTargets(calorieGoal: number, goal?: string) {
  let proteinRatio: number
  let fatRatio: number
  let carbRatio: number

  switch (goal) {
    case 'build_muscle':
      proteinRatio = 0.3 // 30% protein
      fatRatio = 0.25   // 25% fat
      carbRatio = 0.45  // 45% carbs
      break
    case 'lose_weight':
      proteinRatio = 0.35 // 35% protein
      fatRatio = 0.25    // 25% fat
      carbRatio = 0.4    // 40% carbs
      break
    default:
      proteinRatio = 0.25 // 25% protein
      fatRatio = 0.3     // 30% fat
      carbRatio = 0.45   // 45% carbs
  }

  return {
    protein: Math.round((calorieGoal * proteinRatio) / 4), // 4 calories per gram
    fat: Math.round((calorieGoal * fatRatio) / 9),        // 9 calories per gram
    carbs: Math.round((calorieGoal * carbRatio) / 4),     // 4 calories per gram
  }
}

// Calculate BMI
export function calculateBMI(weight_kg: number, height_cm: number): number {
  const height_m = height_cm / 100
  return Math.round((weight_kg / (height_m * height_m)) * 10) / 10
}

// Get BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

// Format number with units
export function formatMacro(value: number, unit: string): string {
  return `${Math.round(value * 10) / 10}${unit}`
}

// Calculate percentage of goal achieved
export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}
