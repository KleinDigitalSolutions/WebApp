// OpenFoodFacts API Integration
export interface FoodProduct {
  code: string
  product_name: string
  image_url?: string
  nutriments: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    'fiber_100g'?: number
    'sugars_100g'?: number
    'salt_100g'?: number
  }
  serving_size?: string
  serving_quantity?: number
}

export class OpenFoodFactsAPI {
  private baseUrl = 'https://world.openfoodfacts.org/api/v2'

  async searchProducts(query: string): Promise<FoodProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,image_url,nutriments,serving_size,serving_quantity`
      )
      
      if (!response.ok) {
        throw new Error('Failed to search products')
      }

      const data = await response.json()
      return data.products || []
    } catch (error) {
      console.error('OpenFoodFacts API error:', error)
      return []
    }
  }

  async getProductByBarcode(barcode: string): Promise<FoodProduct | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/product/${barcode}.json?fields=code,product_name,image_url,nutriments,serving_size,serving_quantity`
      )
      
      if (!response.ok) {
        throw new Error('Product not found')
      }

      const data = await response.json()
      return data.product || null
    } catch (error) {
      console.error('OpenFoodFacts API error:', error)
      return null
    }
  }

  // Helper function to calculate nutrition per serving
  calculateNutritionPerServing(product: FoodProduct, grams: number) {
    const { nutriments } = product
    const factor = grams / 100

    return {
      calories: Math.round((nutriments['energy-kcal_100g'] || 0) * factor),
      protein: Math.round((nutriments['proteins_100g'] || 0) * factor * 10) / 10,
      carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * factor * 10) / 10,
      fat: Math.round((nutriments['fat_100g'] || 0) * factor * 10) / 10,
      fiber: Math.round((nutriments['fiber_100g'] || 0) * factor * 10) / 10,
      sugar: Math.round((nutriments['sugars_100g'] || 0) * factor * 10) / 10,
    }
  }
}
