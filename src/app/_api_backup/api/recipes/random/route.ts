import { NextRequest, NextResponse } from 'next/server'
import { MealDBAPI } from '@/lib/themealdb-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const number = parseInt(searchParams.get('number') || '12')

    const mealDB = new MealDBAPI()
    const recipes = await mealDB.getRandomRecipes(Math.min(number, 20))

    return NextResponse.json({ 
      recipes: recipes || [],
      count: recipes?.length || 0
    })
  } catch (error) {
    console.error('Random recipes API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get random recipes',
        recipes: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
