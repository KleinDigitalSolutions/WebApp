import { NextRequest, NextResponse } from 'next/server'
import { MealDBAPI, Recipe } from '@/lib/themealdb-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const area = searchParams.get('area')

    const mealDB = new MealDBAPI()
    let recipes: Recipe[] = []

    if (category && category.trim()) {
      recipes = await mealDB.getRecipesByCategory(category)
    } else if (area && area.trim()) {
      recipes = await mealDB.getRecipesByArea(area)
    } else if (query && query.trim()) {
      // Try searching by name first, if no results try by ingredient
      recipes = await mealDB.searchByName(query)
      if (recipes.length === 0) {
        recipes = await mealDB.searchByIngredient(query)
      }
    } else {
      // If no search criteria, return random recipes
      recipes = await mealDB.getRandomRecipes(12)
    }

    return NextResponse.json({ 
      recipes: recipes || [],
      count: recipes?.length || 0
    })
  } catch (error) {
    console.error('Recipe search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search recipes',
        recipes: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
