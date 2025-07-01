import { NextRequest, NextResponse } from 'next/server'
import { SpoonacularAPI } from '@/lib/spoonacular-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const number = parseInt(searchParams.get('number') || '12')
    const tags = searchParams.get('tags') || undefined

    if (!process.env.SPOONACULAR_API_KEY) {
      return NextResponse.json(
        { error: 'Spoonacular API key not configured' },
        { status: 500 }
      )
    }

    const spoonacularAPI = new SpoonacularAPI(process.env.SPOONACULAR_API_KEY)
    const recipes = await spoonacularAPI.getRandomRecipes(number, tags)

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Random recipes API error:', error)
    return NextResponse.json(
      { error: 'Failed to get random recipes' },
      { status: 500 }
    )
  }
}
