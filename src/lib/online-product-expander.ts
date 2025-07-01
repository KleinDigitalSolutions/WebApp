// Online-Erweiterung der deutschen Lebensmittel-Datenbank
// Sammelt Daten aus öffentlichen APIs und Bot-freundlichen Quellen

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface OnlineProductData {
  name: string
  brand?: string
  category: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  source: string
}

export class OnlineProductExpander {
  
  // OpenFoodFacts Deutschland - Bot-freundlich, Open Source
  static async searchOpenFoodFacts(query: string): Promise<OnlineProductData[]> {
    try {
      const response = await fetch(
        `https://de.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&sort_by=popularity`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      return data.products?.map((product: any) => ({
        name: product.product_name || 'Unbekannt',
        brand: product.brands || undefined,
        category: this.mapOpenFoodFactsCategory(product.categories_tags),
        calories_per_100g: parseFloat(product.nutriments?.['energy-kcal_100g']) || 0,
        protein_per_100g: parseFloat(product.nutriments?.proteins_100g) || 0,
        carbs_per_100g: parseFloat(product.nutriments?.carbohydrates_100g) || 0,
        fat_per_100g: parseFloat(product.nutriments?.fat_100g) || 0,
        source: 'OpenFoodFacts'
      })).filter((p: OnlineProductData) => p.name !== 'Unbekannt') || []
      
    } catch (error) {
      console.error('OpenFoodFacts API error:', error)
      return []
    }
  }

  // USDA FoodData Central - Öffentliche API ohne Rate Limiting
  static async searchUSDA(query: string): Promise<OnlineProductData[]> {
    try {
      const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY'
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`
      )
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      return data.foods?.map((food: any) => {
        const nutrients = food.foodNutrients || []
        
        return {
          name: food.description || 'Unbekannt',
          brand: food.brandOwner || undefined,
          category: this.mapUSDACategory(food.foodCategory),
          calories_per_100g: this.findNutrient(nutrients, 'Energy') || 0,
          protein_per_100g: this.findNutrient(nutrients, 'Protein') || 0,
          carbs_per_100g: this.findNutrient(nutrients, 'Carbohydrate') || 0,
          fat_per_100g: this.findNutrient(nutrients, 'Total lipid') || 0,
          source: 'USDA'
        }
      }).filter((p: OnlineProductData) => p.name !== 'Unbekannt') || []
      
    } catch (error) {
      console.error('USDA API error:', error)
      return []
    }
  }

  // Sammle alle verfügbaren Online-Quellen
  static async searchAllSources(query: string): Promise<OnlineProductData[]> {
    const [openFoodFactsResults, usdaResults] = await Promise.all([
      this.searchOpenFoodFacts(query),
      this.searchUSDA(query)
    ])

    // Kombiniere und dedupliziere Ergebnisse
    const allResults = [...openFoodFactsResults, ...usdaResults]
    
    // Entferne Duplikate basierend auf Namen (vereinfacht)
    const unique = allResults.filter((product, index, self) => 
      self.findIndex(p => 
        p.name.toLowerCase().trim() === product.name.toLowerCase().trim()
      ) === index
    )

    return unique.slice(0, 20) // Limitiere auf 20 Ergebnisse
  }

  // === PRIVATE HELPER FUNCTIONS ===

  private static mapOpenFoodFactsCategory(categories: string[]): string {
    if (!categories || categories.length === 0) return 'pantry'
    
    const categoryString = categories.join(' ').toLowerCase()
    
    if (categoryString.includes('dairy') || categoryString.includes('milk') || categoryString.includes('cheese')) return 'dairy'
    if (categoryString.includes('meat') || categoryString.includes('sausage')) return 'meat'
    if (categoryString.includes('bread') || categoryString.includes('bakery')) return 'bakery'
    if (categoryString.includes('frozen')) return 'frozen'
    if (categoryString.includes('beverage') || categoryString.includes('drink')) return 'beverages'
    if (categoryString.includes('fruit')) return 'fruits'
    if (categoryString.includes('vegetable')) return 'vegetables'
    if (categoryString.includes('snack') || categoryString.includes('sweet')) return 'snacks'
    
    return 'pantry'
  }

  private static mapUSDACategory(category: string): string {
    if (!category) return 'pantry'
    
    const cat = category.toLowerCase()
    
    if (cat.includes('dairy')) return 'dairy'
    if (cat.includes('meat') || cat.includes('poultry')) return 'meat'
    if (cat.includes('baked')) return 'bakery'
    if (cat.includes('beverage')) return 'beverages'
    if (cat.includes('fruit')) return 'fruits'
    if (cat.includes('vegetable')) return 'vegetables'
    if (cat.includes('snack') || cat.includes('candy')) return 'snacks'
    
    return 'pantry'
  }

  private static findNutrient(nutrients: any[], name: string): number {
    const nutrient = nutrients.find(n => 
      n.nutrientName?.toLowerCase().includes(name.toLowerCase())
    )
    return nutrient?.value || 0
  }
}

// === DEUTSCHE PRODUKTKURATOR ===

export class GermanProductCurator {
  
  // Kuratiere Online-Ergebnisse für deutsche Nutzer
  static async findGermanProducts(query: string): Promise<OnlineProductData[]> {
    const onlineResults = await OnlineProductExpander.searchAllSources(query)
    
    // Filtere nach deutschen/europäischen Produkten
    return onlineResults.filter(product => {
      const name = product.name.toLowerCase()
      const brand = (product.brand || '').toLowerCase()
      
      // Deutsche Begriffe
      const germanTerms = [
        'deutsch', 'germany', 'bio', 'natur', 'vollkorn', 'frisch',
        'regional', 'tradition', 'original', 'klassisch'
      ]
      
      // Bekannte deutsche/europäische Marken
      const germanBrands = [
        'aldi', 'lidl', 'rewe', 'edeka', 'penny', 'netto',
        'ja!', 'gut günstig', 'meine meierei', 'weihenstephan',
        'kerrygold', 'danone', 'dr oetker', 'knorr', 'maggi',
        'haribo', 'milka', 'ritter sport', 'ferrero', 'barilla'
      ]
      
      return germanTerms.some(term => name.includes(term) || brand.includes(term)) ||
             germanBrands.some(brand_name => brand.includes(brand_name))
    }).slice(0, 10)
  }

  // Automatische Datenbankpflege - kann periodisch ausgeführt werden
  static async expandDatabase(): Promise<{
    newProducts: number
    totalSources: number
    errors: string[]
  }> {
    const popularQueries = [
      'brot', 'milch', 'käse', 'wurst', 'joghurt', 'butter', 'eier',
      'äpfel', 'bananen', 'tomaten', 'kartoffeln', 'reis', 'nudeln',
      'pizza', 'schokolade', 'kaffee', 'tee', 'bier', 'wasser'
    ]

    let newProducts = 0
    let totalSources = 0
    const errors: string[] = []

    for (const query of popularQueries) {
      try {
        const results = await this.findGermanProducts(query)
        newProducts += results.length
        totalSources += results.reduce((acc, p) => acc + (p.source ? 1 : 0), 0)
        
        // Hier könnten die Ergebnisse in die Supabase-Datenbank gespeichert werden
        // await this.saveToSupabase(results)
        
      } catch (error) {
        errors.push(`Error fetching ${query}: ${error}`)
      }
    }

    return { newProducts, totalSources, errors }
  }
}
