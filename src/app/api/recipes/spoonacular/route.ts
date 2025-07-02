import { NextRequest, NextResponse } from 'next/server'
import { SpoonacularAPI } from '@/lib/spoonacular-api'

// Set your Spoonacular API key here or use process.env.SPOONACULAR_API_KEY
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const number = parseInt(searchParams.get('number') || '12')
    const query = searchParams.get('q') || ''

    const spoon = new SpoonacularAPI(SPOONACULAR_API_KEY)
    let recipes = []
    if (query) {
      recipes = await spoon.searchRecipes(query, undefined, undefined, number)
    } else {
      recipes = await spoon.getRandomRecipes(number)
    }
    return NextResponse.json({ recipes: recipes || [], count: recipes?.length || 0 })
  } catch (error) {
    console.error('Spoonacular API error:', error)
    return NextResponse.json({ error: 'Failed to get recipes from Spoonacular', recipes: [], count: 0 }, { status: 500 })
  }
}
