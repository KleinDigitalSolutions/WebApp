// OpenFoodFacts API Integration
export interface FoodProduct {
  code: string
  product_name: string
  product_name_de?: string  // German product name
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
  countries_tags?: string[]
  stores_tags?: string[]
  brands?: string
}

export class OpenFoodFactsAPI {
  private baseUrl = 'https://world.openfoodfacts.org/api/v2'

  // German market optimization parameters
  private getGermanMarketParams(): string {
    const params = new URLSearchParams({
      // Country filter for German market
      countries_tags: 'germany',
      // Language preference
      lc: 'de',
      // German stores
      stores_tags: 'edeka,rewe,aldi,lidl,penny,netto,kaufland,dm',
      // Return relevant fields
      fields: 'code,product_name,product_name_de,image_url,nutriments,serving_size,serving_quantity,brands,countries_tags,stores_tags'
    })
    return params.toString()
  }

  async searchProducts(query: string): Promise<FoodProduct[]> {
    try {
      let products: FoodProduct[] = []
      
      // Optimized search strategies for German market
      const searchStrategies = [
        // Primary: German market optimized search
        `${this.baseUrl}/search?search_terms=${encodeURIComponent(query)}&${this.getGermanMarketParams()}&page_size=20`,
        // Fallback: Broader European search
        `${this.baseUrl}/search?search_terms=${encodeURIComponent(query)}&countries_tags=germany,austria,switzerland&lc=de&page_size=15&fields=code,product_name,product_name_de,image_url,nutriments,serving_size,serving_quantity`,
        // Final fallback: Standard search with English translation
        `${this.baseUrl}/search?search_terms=${encodeURIComponent(this.translateToEnglish(query))}&page_size=10&fields=code,product_name,image_url,nutriments,serving_size,serving_quantity`
      ]

      for (const searchUrl of searchStrategies) {
        try {
          const response = await fetch(searchUrl)
          if (response.ok) {
            const data = await response.json()
            const searchProducts = data.products || []
            
            // Filter products for German market relevance
            const relevantProducts = searchProducts.filter((product: FoodProduct) => {
              if (!product.product_name) return false
              
              // Prefer German product names
              const productName = (product.product_name_de || product.product_name || '').toLowerCase()
              const searchTerm = query.toLowerCase()
              
              // Exclude irrelevant products
              if (this.isIrrelevantProduct(productName, searchTerm)) {
                return false
              }
              
              // Must have some nutrition data to be relevant
              if (!this.containsNutritionData(product)) {
                return false
              }
              
              // Prefer products available in German stores
              const isGermanProduct = this.isGermanMarketProduct(product)
              
              // Enhanced relevance check with German preference
              const isRelevant = productName.includes(searchTerm) || 
                                this.isRelevantProduct(productName, searchTerm)
              
              return isRelevant && (isGermanProduct || products.length < 10)
            })
            
            // Sort by German market preference
            const sortedProducts = relevantProducts.sort((a: FoodProduct, b: FoodProduct) => {
              const aIsGerman = this.isGermanMarketProduct(a)
              const bIsGerman = this.isGermanMarketProduct(b)
              
              if (aIsGerman && !bIsGerman) return -1
              if (!aIsGerman && bIsGerman) return 1
              return 0
            })
            
            // Add relevant products, avoiding duplicates
            const existingCodes = new Set(products.map(p => p.code))
            const newProducts = sortedProducts
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

      // If we have very few results for common foods, add fallbacks
      if (products.length < 3 && this.isCommonFood(query)) {
        const fallbackProducts = this.getFallbackProducts(query)
        const existingCodes = new Set(products.map(p => p.code))
        const newFallbacks = fallbackProducts.filter(p => !existingCodes.has(p.code))
        products = [...products, ...newFallbacks]
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
            'sugars_100g': 4.8,
            'salt_100g': 0.1
          },
          serving_size: '200ml',
          serving_quantity: 200
        },
        {
          code: 'fallback_milk_2',
          product_name: 'Fettarme Milch 1,5% Fett',
          nutriments: {
            'energy-kcal_100g': 47,
            'proteins_100g': 3.4,
            'carbohydrates_100g': 4.9,
            'fat_100g': 1.5,
            'sugars_100g': 4.9,
            'salt_100g': 0.1
          },
          serving_size: '200ml',
          serving_quantity: 200
        },
        {
          code: 'fallback_milk_3',
          product_name: 'H-Milch 3,5% Fett',
          nutriments: {
            'energy-kcal_100g': 64,
            'proteins_100g': 3.4,
            'carbohydrates_100g': 4.8,
            'fat_100g': 3.5,
            'sugars_100g': 4.8,
            'salt_100g': 0.1
          },
          serving_size: '250ml',
          serving_quantity: 250
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
      'joghurt': ['yogurt', 'yoghurt', 'yaourt', 'jogurt', 'fermentiert', 'alpro', 'soja'],
      'brot': ['bread', 'brød', 'pain', 'pane', 'weizen', 'vollkorn', 'scheibe', 'toast'],
      'milch': ['milk', 'lait', 'latte', 'leche', 'vollmilch', 'h-milch', 'frischmilch', 'molke', 'laktose'],
      'käse': ['cheese', 'fromage', 'formaggio', 'queso', 'frischkäse', 'hartkäse'],
      'apfel': ['apple', 'pomme', 'mela', 'manzana', 'frucht'],
      'banane': ['banana', 'banane', 'banana', 'plátano'],
      'reis': ['rice', 'riz', 'riso', 'arroz', 'basmati', 'jasmin'],
      'nudeln': ['pasta', 'noodles', 'pâtes', 'spaghetti', 'tagliatelle', 'penne']
    }

    const category = foodCategories[searchTerm]
    if (category) {
      return category.some(keyword => productName.includes(keyword))
    }

    // Additional relevance for specific searches
    if (searchTerm.includes('milch') && (
      productName.includes('entier') || // French for whole milk
      productName.includes('uht') ||
      productName.includes('frais') ||
      productName.includes('bio') ||
      productName.includes('3,5') ||
      productName.includes('1,5')
    )) {
      return true
    }

    return false
  }

  private isIrrelevantProduct(productName: string, searchTerm: string): boolean {
    // Exclude water and non-food items for food searches
    const irrelevantItems = [
      'wasser', 'water', 'eau', 'acqua', 'agua',
      'mineralwasser', 'mineral water',
      'sprudel', 'sparkling', 'gazeux', 'gassata',
      'limonade', 'lemonade', 'soda', 'cola',
      'energy drink', 'energydrink'
    ]
    
    // For milk searches, exclude non-dairy items
    if (searchTerm.includes('milch') || searchTerm.includes('milk')) {
      const milkIrrelevant = [
        'wasser', 'water', 'mineralwasser', 'sprudel',
        'saft', 'juice', 'tee', 'tea', 'kaffee', 'coffee'
      ]
      if (milkIrrelevant.some(item => productName.includes(item))) {
        return true
      }
    }
    
    // For yogurt searches, exclude non-dairy items
    if (searchTerm.includes('joghurt') || searchTerm.includes('yogurt')) {
      const yogurtIrrelevant = [
        'wasser', 'water', 'mineralwasser', 'sprudel',
        'saft', 'juice', 'tee', 'tea', 'kaffee', 'coffee',
        'käse', 'cheese' // unless it's specifically yogurt cheese
      ]
      if (yogurtIrrelevant.some(item => productName.includes(item)) && 
          !productName.includes('joghurt') && !productName.includes('yogurt')) {
        return true
      }
    }
    
    // For bread searches, exclude drinks and other non-bread items
    if (searchTerm.includes('brot') || searchTerm.includes('bread')) {
      const breadIrrelevant = [
        'wasser', 'water', 'milch', 'milk', 'saft', 'juice',
        'joghurt', 'yogurt', 'käse', 'cheese'
      ]
      if (breadIrrelevant.some(item => productName.includes(item))) {
        return true
      }
    }
    
    // General irrelevant items
    return irrelevantItems.some(item => productName.includes(item))
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

  private isCommonFood(query: string): boolean {
    const commonFoods = ['milch', 'milk', 'joghurt', 'yogurt', 'brot', 'bread', 'käse', 'cheese']
    return commonFoods.some(food => query.toLowerCase().includes(food))
  }

  // Check if product is from German market
  private isGermanMarketProduct(product: FoodProduct): boolean {
    // Check if product is sold in German stores
    const germanStores = ['edeka', 'rewe', 'aldi', 'lidl', 'penny', 'netto', 'kaufland', 'dm', 'rossmann']
    const hasGermanStore = product.stores_tags?.some(store => 
      germanStores.some(germanStore => store.toLowerCase().includes(germanStore))
    ) || false

    // Check if product is available in Germany
    const hasGermanyCountry = product.countries_tags?.some(country => 
      country.toLowerCase().includes('germany') || country.toLowerCase().includes('deutschland')
    ) || false

    // Check for German brands (basic check)
    const germanBrands = ['müller', 'edeka', 'rewe', 'aldi', 'lidl', 'ja!', 'gut & günstig']
    const hasGermanBrand = product.brands ? 
      germanBrands.some(brand => product.brands!.toLowerCase().includes(brand)) : false

    return hasGermanStore || hasGermanyCountry || hasGermanBrand
  }
}
