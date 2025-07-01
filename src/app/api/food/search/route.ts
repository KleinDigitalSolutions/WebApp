import { NextRequest, NextResponse } from 'next/server'
import { OpenFoodFactsAPI, FoodProduct } from '@/lib/openfoodfacts-api'
import { SpoonacularAPI, SpoonacularIngredient } from '@/lib/spoonacular-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Get environment variables
    const spoonacularApiKey = process.env.SPOONACULAR_API_KEY

    // Search from OpenFoodFacts first
    const openFoodFactsAPI = new OpenFoodFactsAPI()
    const openFoodProducts = await openFoodFactsAPI.searchProducts(query)

    let allProducts: FoodProduct[] = [...openFoodProducts]

    // If we have Spoonacular API key and need more results, also search ingredients
    if (spoonacularApiKey && openFoodProducts.length < 10) {
      try {
        const spoonacularAPI = new SpoonacularAPI(spoonacularApiKey)
        const ingredients = await spoonacularAPI.searchIngredients(query, 10)
        
        // Convert Spoonacular ingredients to our format
        const spoonacularProducts = await Promise.all(
          ingredients.map(async (ingredient: SpoonacularIngredient) => {
            try {
              const nutrition = await spoonacularAPI.getIngredientNutrition(ingredient.id, 100, 'grams')
              
              const product: FoodProduct = {
                code: `spoonacular_${ingredient.id}`,
                product_name: ingredient.name || ingredient.original || 'Unbekanntes Produkt',
                image_url: ingredient.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` : undefined,
                nutriments: {
                  'energy-kcal_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                  'proteins_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                  'carbohydrates_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                  'fat_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
                  'fiber_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Fiber')?.amount || 0,
                  'sugars_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Sugar')?.amount || 0,
                  'salt_100g': nutrition?.nutrition?.nutrients?.find(n => n.name === 'Sodium')?.amount || 0,
                },
                serving_size: '100g',
                serving_quantity: 100
              }
              
              return product
            } catch (error) {
              console.error('Error processing Spoonacular ingredient:', error)
              return null
            }
          })
        )
        
        // Filter out null results and add valid ones
        const validSpoonacularProducts = spoonacularProducts.filter((p): p is FoodProduct => p !== null)
        allProducts = [...allProducts, ...validSpoonacularProducts]
      } catch (error) {
        console.error('Spoonacular search error:', error)
        // Continue with OpenFoodFacts results only
      }
    }

    // Sort by relevance (products with names that match the query more closely)
    const sortedProducts = allProducts.sort((a, b) => {
      const aNameLower = a.product_name.toLowerCase()
      const bNameLower = b.product_name.toLowerCase()
      const queryLower = query.toLowerCase()
      
      // Exact matches first
      if (aNameLower.includes(queryLower) && !bNameLower.includes(queryLower)) return -1
      if (!aNameLower.includes(queryLower) && bNameLower.includes(queryLower)) return 1
      
      // Then by how early the match appears
      const aIndex = aNameLower.indexOf(queryLower)
      const bIndex = bNameLower.indexOf(queryLower)
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      
      return 0
    })

    return NextResponse.json({ products: sortedProducts.slice(0, 20) })
  } catch (error) {
    console.error('Food search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search food products' },
      { status: 500 }
    )
  }
}
