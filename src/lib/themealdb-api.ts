// TheMealDB API Integration (Completely Free!)
export interface MealDBRecipe {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strInstructions: string
  strCategory: string
  strArea: string
  strYoutube?: string
  strSource?: string
  [key: string]: string | undefined // For dynamic ingredient/measure fields
}

export interface Recipe {
  id: string
  title: string
  image: string
  category: string
  area: string
  instructions: string
  ingredients: Array<{
    name: string
    measure: string
  }>
  youtubeUrl?: string
  sourceUrl?: string
}

export class MealDBAPI {
  private baseUrl = 'https://www.themealdb.com/api/json/v1/1'

  // Search recipes by name
  async searchByName(query: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search.php?s=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (!data.meals) return []
      
      return data.meals.map((meal: MealDBRecipe) => this.formatRecipe(meal))
    } catch (error) {
      console.error('Error searching recipes by name:', error)
      return []
    }
  }

  // Search recipes by main ingredient
  async searchByIngredient(ingredient: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/filter.php?i=${encodeURIComponent(ingredient)}`)
      const data = await response.json()
      
      if (!data.meals) return []
      
      // Get full details for each meal (filter only returns basic info)
      const detailedRecipes = await Promise.all(
        data.meals.slice(0, 20).map(async (meal: MealDBRecipe) => {
          const details = await this.getRecipeById(meal.idMeal)
          return details
        })
      )
      
      return detailedRecipes.filter(recipe => recipe !== null) as Recipe[]
    } catch (error) {
      console.error('Error searching recipes by ingredient:', error)
      return []
    }
  }

  // Get random recipes
  async getRandomRecipes(count: number = 12): Promise<Recipe[]> {
    try {
      const recipes: Recipe[] = []
      
      // TheMealDB only gives 1 random recipe per call, so we make multiple calls
      const promises = Array(Math.min(count, 20)).fill(null).map(() => 
        fetch(`${this.baseUrl}/random.php`).then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      
      for (const data of results) {
        if (data.meals && data.meals[0]) {
          recipes.push(this.formatRecipe(data.meals[0]))
        }
      }
      
      return recipes
    } catch (error) {
      console.error('Error getting random recipes:', error)
      return []
    }
  }

  // Get recipe by ID
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const response = await fetch(`${this.baseUrl}/lookup.php?i=${id}`)
      const data = await response.json()
      
      if (!data.meals || !data.meals[0]) return null
      
      return this.formatRecipe(data.meals[0])
    } catch (error) {
      console.error('Error getting recipe by ID:', error)
      return null
    }
  }

  // Get recipes by category
  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`)
      const data = await response.json()
      
      if (!data.meals) return []
      
      // Get full details for first 12 recipes
      const detailedRecipes = await Promise.all(
        data.meals.slice(0, 12).map(async (meal: MealDBRecipe) => {
          const details = await this.getRecipeById(meal.idMeal)
          return details
        })
      )
      
      return detailedRecipes.filter(recipe => recipe !== null) as Recipe[]
    } catch (error) {
      console.error('Error getting recipes by category:', error)
      return []
    }
  }

  // Get recipes by area/cuisine
  async getRecipesByArea(area: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/filter.php?a=${encodeURIComponent(area)}`)
      const data = await response.json()
      
      if (!data.meals) return []
      
      // Get full details for first 12 recipes
      const detailedRecipes = await Promise.all(
        data.meals.slice(0, 12).map(async (meal: MealDBRecipe) => {
          const details = await this.getRecipeById(meal.idMeal)
          return details
        })
      )
      
      return detailedRecipes.filter(recipe => recipe !== null) as Recipe[]
    } catch (error) {
      console.error('Error getting recipes by area:', error)
      return []
    }
  }

  // Format recipe from MealDB format to our format
  private formatRecipe(meal: MealDBRecipe): Recipe {
    const ingredients: Array<{name: string, measure: string}> = []
    
    // Extract ingredients and measures (up to 20)
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]
      const measure = meal[`strMeasure${i}`]
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure?.trim() || ''
        })
      }
    }
    
    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      instructions: meal.strInstructions,
      ingredients,
      youtubeUrl: meal.strYoutube || undefined,
      sourceUrl: meal.strSource || undefined
    }
  }

  // Get all available categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories.php`)
      const data = await response.json()
      
      if (!data.categories) return []
      
      return data.categories.map((cat: { strCategory: string }) => cat.strCategory)
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  }

  // Get all available areas/cuisines
  async getAreas(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/list.php?a=list`)
      const data = await response.json()
      
      if (!data.meals) return []
      
      return data.meals.map((area: { strArea: string }) => area.strArea)
    } catch (error) {
      console.error('Error getting areas:', error)
      return []
    }
  }
}
