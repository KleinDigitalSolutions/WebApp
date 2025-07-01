import { NextRequest, NextResponse } from 'next/server'
import { SpoonacularAPI } from '@/lib/spoonacular-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const diet = searchParams.get('diet') || undefined
    const intolerances = searchParams.get('intolerances') || undefined
    const number = parseInt(searchParams.get('number') || '12')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    if (!process.env.SPOONACULAR_API_KEY) {
      return NextResponse.json(
        { error: 'Spoonacular API key not configured' },
        { status: 500 }
      )
    }

    const spoonacularAPI = new SpoonacularAPI(process.env.SPOONACULAR_API_KEY)
    const recipes = await spoonacularAPI.searchRecipes(query, diet, intolerances, number)

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Recipe search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    )
  }
}
