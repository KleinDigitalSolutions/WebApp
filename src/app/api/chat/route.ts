import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GroqAPI, ChatMessage } from '@/lib/groq-api'

// Server-side Supabase client for accessing user data
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { messages, userProfile, userId } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    // Get user's recent diary entries for context
    let diaryContext = ''
    if (userId) {
      try {
        // Get last 7 days of diary entries
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { data: diaryEntries } = await supabaseAdmin
          .from('diary_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(50)

        if (diaryEntries && diaryEntries.length > 0) {
          // Analyze nutrition patterns
          const totalCalories = diaryEntries.reduce((sum, entry) => sum + entry.calories, 0)
          const totalProtein = diaryEntries.reduce((sum, entry) => sum + (entry.protein_g || 0), 0)
          const totalCarbs = diaryEntries.reduce((sum, entry) => sum + (entry.carb_g || 0), 0)
          const totalFat = diaryEntries.reduce((sum, entry) => sum + (entry.fat_g || 0), 0)
          const totalSugar = diaryEntries.reduce((sum, entry) => sum + (entry.sugar_g || 0), 0)
          const totalFiber = diaryEntries.reduce((sum, entry) => sum + (entry.fiber_g || 0), 0)
          const totalSodium = diaryEntries.reduce((sum, entry) => sum + (entry.sodium_mg || 0), 0)
          
          // Calculate averages per day
          const daysWithEntries = new Set(diaryEntries.map(entry => 
            new Date(entry.created_at).toDateString()
          )).size
          const avgCaloriesPerDay = Math.round(totalCalories / Math.max(daysWithEntries, 1))
          const avgProteinPerDay = Math.round(totalProtein / Math.max(daysWithEntries, 1))
          
          // Group by food items to find patterns
          const foodCounts: Record<string, number> = {}
          const mealPatterns: Record<string, number> = {}
          const unhealthyPatterns: string[] = []
          
          diaryEntries.forEach(entry => {
            foodCounts[entry.food_name] = (foodCounts[entry.food_name] || 0) + 1
            mealPatterns[entry.meal_type] = (mealPatterns[entry.meal_type] || 0) + 1
            
            // Detect unhealthy patterns
            const foodName = entry.food_name.toLowerCase()
            if (foodName.includes('cola') || foodName.includes('softdrink') || foodName.includes('limonade')) {
              unhealthyPatterns.push(`Zuckerhaltige Getränke: ${entry.food_name}`)
            }
            if (foodName.includes('chips') || foodName.includes('pommes') || foodName.includes('burger')) {
              unhealthyPatterns.push(`Fast Food: ${entry.food_name}`)
            }
            if (foodName.includes('süßigkeiten') || foodName.includes('schokolade') || foodName.includes('keks')) {
              unhealthyPatterns.push(`Süßwaren: ${entry.food_name}`)
            }
          })

          // Find most consumed foods
          const topFoods = Object.entries(foodCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([food, count]) => `${food} (${count}x)`)

          // Calculate nutrition ratios
          const proteinPercent = totalCalories > 0 ? Math.round((totalProtein * 4 / totalCalories) * 100) : 0
          const carbPercent = totalCalories > 0 ? Math.round((totalCarbs * 4 / totalCalories) * 100) : 0
          const fatPercent = totalCalories > 0 ? Math.round((totalFat * 9 / totalCalories) * 100) : 0

          diaryContext = `
DETAILLIERTE ERNÄHRUNGSANALYSE (letzte 7 Tage):

📊 MAKRONÄHRSTOFFE:
- Gesamtkalorien: ${totalCalories} kcal (⌀ ${avgCaloriesPerDay} kcal/Tag)
- Protein: ${totalProtein.toFixed(1)}g (${proteinPercent}% der Kalorien, ⌀ ${avgProteinPerDay}g/Tag)
- Kohlenhydrate: ${totalCarbs.toFixed(1)}g (${carbPercent}% der Kalorien)
- Fett: ${totalFat.toFixed(1)}g (${fatPercent}% der Kalorien)
- Zucker: ${totalSugar.toFixed(1)}g
- Ballaststoffe: ${totalFiber.toFixed(1)}g
- Natrium: ${totalSodium.toFixed(0)}mg

🍽️ ESSGEWOHNHEITEN:
- Aktive Tage mit Einträgen: ${daysWithEntries}
- Häufigste Lebensmittel: ${topFoods.join(', ')}
- Mahlzeiten-Verteilung: ${Object.entries(mealPatterns).map(([meal, count]) => `${meal}(${count})`).join(', ')}
- Einträge gesamt: ${diaryEntries.length}

⚠️ AUFFÄLLIGKEITEN:
${unhealthyPatterns.length > 0 ? unhealthyPatterns.slice(0, 5).join('\n') : 'Keine besonderen Auffälligkeiten erkannt'}

📝 LETZTE MAHLZEITEN:
${diaryEntries.slice(0, 8).map(entry => {
  const date = new Date(entry.created_at).toLocaleDateString('de-DE')
  return `- ${date}: ${entry.food_name} (${entry.meal_type}, ${entry.calories}kcal)`
}).join('\n')}

WICHTIG FÜR KI-ANALYSE:
- Bewerte die Nährstoffverteilung (ideal: 15-25% Protein, 45-65% Kohlenhydrate, 20-35% Fett)
- Achte auf Ballaststoffzufuhr (sollte 25-30g/Tag sein)
- Prüfe auf zu viel Zucker oder verarbeitete Lebensmittel
- Bewerte die Regelmäßigkeit der Mahlzeiten
- Gib konkrete, umsetzbare Verbesserungsvorschläge
`
        }
      } catch (error) {
        console.error('Error fetching diary data:', error)
      }
    }

    const groqAPI = new GroqAPI()
    
    // Enhanced system prompt with diary context
    const systemPrompt = groqAPI.createNutritionExpertPrompt(userProfile, diaryContext)
    const allMessages: ChatMessage[] = [systemPrompt, ...messages]

    const response = await groqAPI.chat(allMessages)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
