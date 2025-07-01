// Spoonacular API Integration
export interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  imageType: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  spoonacularSourceUrl: string
}

export interface SpoonacularIngredient {
  id: number
  name: string
  image?: string
  original?: string
}

export interface IngredientNutrition {
  nutrition?: {
    nutrients?: Array<{
      name: string
      amount: number
      unit: string
      percentOfDailyNeeds?: number
    }>
  }
}

export interface RecipeInformation {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  instructions: string
  extendedIngredients: Array<{
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }>
  nutrition: {
    nutrients: Array<{
      name: string
      amount: number
      unit: string
      percentOfDailyNeeds: number
    }>
  }
}

export class SpoonacularAPI {
  private apiKey: string
  private baseUrl = 'https://api.spoonacular.com/recipes'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchRecipes(
    query: string,
    diet?: string,
    intolerances?: string,
    number: number = 12
  ): Promise<SpoonacularRecipe[]> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        query,
        number: number.toString(),
        addRecipeInformation: 'true',
        fillIngredients: 'true',
      })

      if (diet) params.append('diet', diet)
      if (intolerances) params.append('intolerances', intolerances)

      const response = await fetch(`${this.baseUrl}/complexSearch?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to search recipes')
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Spoonacular API error:', error)
      return []
    }
  }

  async getRecipeInformation(id: number): Promise<RecipeInformation | null> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        includeNutrition: 'true',
      })

      const response = await fetch(`${this.baseUrl}/${id}/information?${params}`)
      
      if (!response.ok) {
        throw new Error('Recipe not found')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Spoonacular API error:', error)
      return null
    }
  }

  async getRandomRecipes(number: number = 3, tags?: string): Promise<SpoonacularRecipe[]> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        number: number.toString(),
      })

      if (tags) params.append('tags', tags)

      const response = await fetch(`${this.baseUrl}/random?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to get random recipes')
      }

      const data = await response.json()
      return data.recipes || []
    } catch (error) {
      console.error('Spoonacular API error:', error)
      return []
    }
  }

  // New method for ingredient search
  async searchIngredients(query: string, number: number = 20): Promise<SpoonacularIngredient[]> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        query,
        number: number.toString(),
        metaInformation: 'true',
      })

      const response = await fetch(`https://api.spoonacular.com/food/ingredients/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to search ingredients')
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Spoonacular ingredient search error:', error)
      return []
    }
  }

  // Get nutrition information for an ingredient
  async getIngredientNutrition(id: number, amount: number = 100, unit: string = 'grams'): Promise<IngredientNutrition | null> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        amount: amount.toString(),
        unit,
      })

      const response = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to get ingredient nutrition')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Spoonacular nutrition error:', error)
      return null
    }
  }
}
