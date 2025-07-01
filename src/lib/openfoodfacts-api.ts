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
      let products: FoodProduct[] = []
      
      // Multiple search strategies for better results
      const searchStrategies = [
        // Direct product search
        `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,image_url,nutriments,serving_size,serving_quantity`,
        // Category-based search
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,image_url,nutriments,serving_size,serving_quantity`,
        // English translation search
        `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(this.translateToEnglish(query))}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,image_url,nutriments,serving_size,serving_quantity`
      ]

      for (const searchUrl of searchStrategies) {
        try {
          const response = await fetch(searchUrl)
          if (response.ok) {
            const data = await response.json()
            const searchProducts = data.products || []
            
            // Filter products for relevance
            const relevantProducts = searchProducts.filter((product: FoodProduct) => {
              if (!product.product_name) return false
              
              const productName = product.product_name.toLowerCase()
              const searchTerm = query.toLowerCase()
              
              // Basic relevance check
              return productName.includes(searchTerm) || 
                     this.isRelevantProduct(productName, searchTerm) ||
                     this.containsNutritionData(product)
            })
            
            // Add relevant products, avoiding duplicates
            const existingCodes = new Set(products.map(p => p.code))
            const newProducts = relevantProducts
              .filter((p: FoodProduct) => !existingCodes.has(p.code))
              .slice(0, 20 - products.length)
            
            products = [...products, ...newProducts]
            
            // If we have enough results, break
            if (products.length >= 15) break
          }
        } catch (error) {
          console.error(`Search failed for URL: ${searchUrl}`, error)
          continue
        }
      }

      // If still no results, add some hardcoded examples for common foods
      if (products.length === 0) {
        products = this.getFallbackProducts(query)
      }

      // Filter out products with incomplete data
      const filteredProducts = products.filter(product => 
        product.product_name && 
        product.product_name.trim().length > 0
      )

      return filteredProducts.slice(0, 20)
    } catch (error) {
      console.error('OpenFoodFacts API error:', error)
      return this.getFallbackProducts(query)
    }
  }

  private translateToEnglish(germanTerm: string): string {
    const translations: { [key: string]: string } = {
      'joghurt': 'yogurt',
      'brot': 'bread',
      'milch': 'milk',
      'käse': 'cheese',
      'apfel': 'apple',
      'banane': 'banana',
      'reis': 'rice',
      'nudeln': 'pasta',
      'fleisch': 'meat',
      'fisch': 'fish',
      'gemüse': 'vegetables',
      'obst': 'fruit'
    }
    return translations[germanTerm.toLowerCase()] || germanTerm
  }

  private containsNutritionData(product: FoodProduct): boolean {
    return !!(product.nutriments && (
      product.nutriments['energy-kcal_100g'] || 
      product.nutriments['proteins_100g'] || 
      product.nutriments['carbohydrates_100g'] ||
      product.nutriments['fat_100g']
    ))
  }

  private getFallbackProducts(query: string): FoodProduct[] {
    const fallbackData: { [key: string]: FoodProduct[] } = {
      'joghurt': [
        {
          code: 'fallback_yogurt_1',
          product_name: 'Naturjoghurt 3,5% Fett',
          nutriments: {
            'energy-kcal_100g': 66,
            'proteins_100g': 4.3,
            'carbohydrates_100g': 4.7,
            'fat_100g': 3.5,
            'sugars_100g': 4.7
          },
          serving_size: '150g',
          serving_quantity: 150
        },
        {
          code: 'fallback_yogurt_2',
          product_name: 'Griechischer Joghurt',
          nutriments: {
            'energy-kcal_100g': 133,
            'proteins_100g': 9.0,
            'carbohydrates_100g': 4.0,
            'fat_100g': 10.0,
            'sugars_100g': 4.0
          },
          serving_size: '150g',
          serving_quantity: 150
        }
      ],
      'brot': [
        {
          code: 'fallback_bread_1',
          product_name: 'Vollkornbrot',
          nutriments: {
            'energy-kcal_100g': 250,
            'proteins_100g': 8.5,
            'carbohydrates_100g': 45.2,
            'fat_100g': 3.1,
            'fiber_100g': 7.8
          },
          serving_size: '1 Scheibe (25g)',
          serving_quantity: 25
        }
      ],
      'milch': [
        {
          code: 'fallback_milk_1',
          product_name: 'Vollmilch 3,5% Fett',
          nutriments: {
            'energy-kcal_100g': 64,
            'proteins_100g': 3.4,
            'carbohydrates_100g': 4.8,
            'fat_100g': 3.5,
            'sugars_100g': 4.8
          },
          serving_size: '200ml',
          serving_quantity: 200
        }
      ]
    }

    const lowerQuery = query.toLowerCase()
    for (const [key, products] of Object.entries(fallbackData)) {
      if (lowerQuery.includes(key)) {
        return products
      }
    }
    
    return []
  }

  private isRelevantProduct(productName: string, searchTerm: string): boolean {
    // Define food category mappings for better relevance
    const foodCategories: { [key: string]: string[] } = {
      'joghurt': ['yogurt', 'yoghurt', 'yaourt', 'jogurt', 'milch'],
      'brot': ['bread', 'brød', 'pain', 'pane', 'weizen', 'vollkorn'],
      'milch': ['milk', 'lait', 'latte', 'molke', 'joghurt'],
      'käse': ['cheese', 'fromage', 'formaggio', 'queso', 'frischkäse'],
      'apfel': ['apple', 'pomme', 'mela', 'manzana', 'frucht'],
      'banane': ['banana', 'banane', 'banana', 'plátano'],
      'reis': ['rice', 'riz', 'riso', 'arroz', 'basmati'],
      'nudeln': ['pasta', 'noodles', 'pâtes', 'spaghetti', 'tagliatelle']
    }

    const category = foodCategories[searchTerm]
    if (category) {
      return category.some(keyword => productName.includes(keyword))
    }

    return false
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
