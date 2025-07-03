// Erweiterte OpenFoodFacts Import-Strategie für bekannte deutsche Marken
// Fokus auf populäre Marken + Duplikat-Vermeidung

interface BrandImportConfig {
  brand: string
  priority: number // 1-5 (5 = höchste Priorität)
  categories: string[]
  expectedProducts: number
}

class EnhancedOpenFoodFactsImporter {
  private baseUrl = 'https://world.openfoodfacts.org'
  private delay = 800 // Schneller für große Mengen
  private importedBarcodes = new Set<string>() // Duplikat-Tracking
  
  // Deutsche Top-Marken mit Priorität
  private topGermanBrands: BrandImportConfig[] = [
    // Tier 1: Absolute Top-Marken
    { brand: 'ferrero', priority: 5, categories: ['chocolate', 'spreads'], expectedProducts: 50 },
    { brand: 'nutella', priority: 5, categories: ['spreads'], expectedProducts: 20 },
    { brand: 'milka', priority: 5, categories: ['chocolate'], expectedProducts: 30 },
    { brand: 'haribo', priority: 5, categories: ['snacks', 'candy'], expectedProducts: 40 },
    { brand: 'coca-cola', priority: 5, categories: ['beverages', 'soft-drinks'], expectedProducts: 25 },
    { brand: 'snickers', priority: 5, categories: ['chocolate', 'snacks'], expectedProducts: 20 },
    // Tier 2: Sehr bekannte Marken
    { brand: 'nestle', priority: 4, categories: ['chocolate', 'coffee', 'cereals'], expectedProducts: 60 },
    { brand: 'kelloggs', priority: 4, categories: ['cereals', 'breakfast'], expectedProducts: 30 },
    { brand: 'bahlsen', priority: 4, categories: ['cookies', 'snacks'], expectedProducts: 35 },
    { brand: 'ritter-sport', priority: 4, categories: ['chocolate'], expectedProducts: 25 },
    { brand: 'knorr', priority: 4, categories: ['soups', 'sauces'], expectedProducts: 40 },
    { brand: 'red-bull', priority: 4, categories: ['beverages'], expectedProducts: 20 },
    { brand: 'granini', priority: 4, categories: ['beverages'], expectedProducts: 15 },
    { brand: 'jacobs', priority: 4, categories: ['coffee'], expectedProducts: 20 },
    { brand: 'rügenwalder', priority: 4, categories: ['meat', 'vegan'], expectedProducts: 20 },
    { brand: 'iglo', priority: 4, categories: ['frozen'], expectedProducts: 20 },
    { brand: 'frosta', priority: 4, categories: ['frozen'], expectedProducts: 20 },
    { brand: 'coppenrath-und-wiese', priority: 4, categories: ['bakery', 'frozen'], expectedProducts: 15 },
    { brand: 'zentis', priority: 3, categories: ['spreads'], expectedProducts: 10 },
    // Tier 3: Deutsche Klassiker
    { brand: 'dr-oetker', priority: 4, categories: ['baking', 'frozen'], expectedProducts: 45 },
    { brand: 'maggi', priority: 4, categories: ['sauces', 'soups'], expectedProducts: 35 },
    { brand: 'lorenz', priority: 4, categories: ['snacks'], expectedProducts: 30 },
    { brand: 'leibniz', priority: 4, categories: ['cookies'], expectedProducts: 20 },
    { brand: 'funny-frisch', priority: 4, categories: ['snacks'], expectedProducts: 25 },
    { brand: 'nivea', priority: 3, categories: ['cosmetics'], expectedProducts: 15 },
    // Tier 4: Supermarkt-Eigenmarken
    { brand: 'ja', priority: 3, categories: ['dairy', 'bread', 'pantry'], expectedProducts: 80 },
    { brand: 'gut-gunstig', priority: 3, categories: ['pantry', 'frozen'], expectedProducts: 60 },
    { brand: 'edeka', priority: 3, categories: ['dairy', 'meat', 'pantry'], expectedProducts: 70 },
    { brand: 'rewe', priority: 3, categories: ['dairy', 'pantry'], expectedProducts: 50 },
    { brand: 'aldi', priority: 3, categories: ['pantry', 'dairy'], expectedProducts: 60 },
    // Tier 5: Getränke & Milchprodukte
    { brand: 'beck', priority: 3, categories: ['beer'], expectedProducts: 15 },
    { brand: 'warsteiner', priority: 3, categories: ['beer'], expectedProducts: 12 },
    { brand: 'muller', priority: 4, categories: ['dairy', 'yogurt'], expectedProducts: 40 },
    { brand: 'danone', priority: 4, categories: ['dairy', 'yogurt'], expectedProducts: 35 },
    { brand: 'weihenstephan', priority: 4, categories: ['dairy', 'milk'], expectedProducts: 25 },
    { brand: 'landliebe', priority: 4, categories: ['dairy'], expectedProducts: 20 },
    { brand: 'bresso', priority: 4, categories: ['dairy'], expectedProducts: 10 },
    { brand: 'meggle', priority: 4, categories: ['dairy'], expectedProducts: 10 },
    { brand: 'rama', priority: 4, categories: ['dairy', 'spreads'], expectedProducts: 10 },
    { brand: 'mccain', priority: 4, categories: ['frozen'], expectedProducts: 15 },
    { brand: 'wagner', priority: 4, categories: ['frozen', 'pizza'], expectedProducts: 15 },
    { brand: 'gustavo', priority: 3, categories: ['frozen', 'pizza'], expectedProducts: 8 },
    { brand: 'bertolli', priority: 4, categories: ['oil', 'pasta'], expectedProducts: 10 },
    { brand: 'heinz', priority: 4, categories: ['sauces', 'ketchup'], expectedProducts: 15 },
    { brand: 'rewe-beste-wahl', priority: 3, categories: ['pantry', 'dairy'], expectedProducts: 20 },
    { brand: 'rittersport', priority: 4, categories: ['chocolate'], expectedProducts: 25 },
    { brand: 'kinder', priority: 5, categories: ['chocolate', 'snacks'], expectedProducts: 30 },
    { brand: 'ristorante', priority: 4, categories: ['frozen', 'pizza'], expectedProducts: 10 },
    { brand: 'ben-and-jerrys', priority: 4, categories: ['ice-cream'], expectedProducts: 10 },
    { brand: 'ben-jerrys', priority: 4, categories: ['ice-cream'], expectedProducts: 10 },
    { brand: 'ben-jerry', priority: 4, categories: ['ice-cream'], expectedProducts: 10 },
    { brand: 'mälzer-fu', priority: 3, categories: ['ready-meals'], expectedProducts: 5 },
    { brand: 'rewe-feine-welt', priority: 3, categories: ['pantry', 'gourmet'], expectedProducts: 8 },
    { brand: 'magnum', priority: 4, categories: ['ice-cream'], expectedProducts: 15 },
    { brand: 'nuii', priority: 4, categories: ['ice-cream'], expectedProducts: 10 },
    { brand: 'langnese', priority: 4, categories: ['ice-cream'], expectedProducts: 15 },
    { brand: 'trüfrü', priority: 3, categories: ['snacks', 'frozen'], expectedProducts: 5 },
    { brand: 'rewe-bio', priority: 3, categories: ['bio', 'pantry'], expectedProducts: 10 },
    { brand: 'harry', priority: 3, categories: ['bread'], expectedProducts: 10 },
    { brand: 'lieken', priority: 3, categories: ['bread'], expectedProducts: 10 },
    { brand: 'mestemacher', priority: 3, categories: ['bread'], expectedProducts: 8 },
    { brand: 'harry-anno', priority: 3, categories: ['bread'], expectedProducts: 5 },
    { brand: 'goldentoast', priority: 3, categories: ['bread', 'toast'], expectedProducts: 8 },
    // Zusätzliche Marken (User-Wunsch, Stand Juli 2025)
    { brand: 'barilla', priority: 4, categories: ['pasta'], expectedProducts: 20 },
    { brand: 'genuss pur', priority: 3, categories: ['pantry'], expectedProducts: 10 },
    { brand: 'lien ying', priority: 3, categories: ['asian', 'sauces'], expectedProducts: 10 },
    { brand: 'de cecco', priority: 4, categories: ['pasta'], expectedProducts: 10 },
    { brand: 'reis fit', priority: 3, categories: ['rice'], expectedProducts: 10 },
    { brand: "ben's original", priority: 3, categories: ['rice'], expectedProducts: 10 },
    { brand: 'oryza', priority: 3, categories: ['rice'], expectedProducts: 10 },
    { brand: 'pfanni', priority: 3, categories: ['potato', 'pantry'], expectedProducts: 10 },
    { brand: 'nippon', priority: 3, categories: ['snacks', 'chocolate'], expectedProducts: 10 },
    { brand: 'lindt', priority: 4, categories: ['chocolate'], expectedProducts: 20 },
    { brand: 'schogetten', priority: 3, categories: ['chocolate'], expectedProducts: 10 },
    { brand: 'merci', priority: 3, categories: ['chocolate'], expectedProducts: 10 },
    { brand: 'riesen', priority: 3, categories: ['chocolate', 'candy'], expectedProducts: 10 },
    { brand: 'knoppers', priority: 3, categories: ['snacks', 'chocolate'], expectedProducts: 10 },
    { brand: 'doritos', priority: 3, categories: ['snacks'], expectedProducts: 10 },
    { brand: 'lätta', priority: 3, categories: ['dairy', 'spreads'], expectedProducts: 10 },
    { brand: 'andechser', priority: 3, categories: ['dairy'], expectedProducts: 10 },
    { brand: 'kerrygold', priority: 3, categories: ['dairy'], expectedProducts: 10 },
    { brand: 'butaris', priority: 3, categories: ['dairy', 'fat'], expectedProducts: 10 },
    { brand: 'becel', priority: 3, categories: ['dairy', 'spreads'], expectedProducts: 10 },
    { brand: 'ehrmann', priority: 3, categories: ['dairy', 'yogurt'], expectedProducts: 10 },
    { brand: 'alpro', priority: 4, categories: ['dairy', 'vegan'], expectedProducts: 15 },
    { brand: 'esn', priority: 3, categories: ['supplements', 'protein'], expectedProducts: 10 },
    { brand: 'nimm2', priority: 3, categories: ['candy'], expectedProducts: 10 },
    { brand: 'alnatura', priority: 4, categories: ['bio', 'pantry'], expectedProducts: 20 },
    { brand: 'demeter', priority: 4, categories: ['bio', 'pantry'], expectedProducts: 15 },
  ]

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fetchProductsByBrand(brand: string, page = 1, pageSize = 100): Promise<any> {
    const params = new URLSearchParams({
      'countries_tags_en': 'germany',
      'brands_tags_en': brand,
      'fields': 'code,product_name,brands,categories,nutrition_data_per,nutriments,image_url,popularity',
      'page': page.toString(),
      'page_size': pageSize.toString(),
      'sort_by': 'popularity' // Beliebteste Produkte zuerst
    })

    const url = `${this.baseUrl}/api/v0/search?${params}`
    
    console.log(`🔍 Fetching brand: ${brand} (page ${page})`)
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      await this.sleep(this.delay)
      
      return data
    } catch (error) {
      console.error(`❌ Error fetching brand ${brand}:`, error)
      return { products: [] }
    }
  }

  private isValidProduct(product: any): boolean {
    // Strikte Qualitätskontrolle
    return (
      product.code && 
      product.product_name && 
      product.nutrition_data_per === '100g' &&
      product.nutriments &&
      product.product_name.length > 2 &&
      !product.product_name.toLowerCase().includes('test') &&
      !product.product_name.toLowerCase().includes('sample') &&
      !this.importedBarcodes.has(product.code) // Duplikat-Check
    )
  }

  private normalizeProduct(product: any, brand: string): any {
    // Barcode als importiert markieren
    this.importedBarcodes.add(product.code)
    
    return {
      name: product.product_name.trim(),
      brand: brand,
      barcode: product.code,
      category: 'pantry', // Standard für Import
      imageUrl: product.image_url || null,
      nutritionPer100g: {
        calories: Math.round(product.nutriments['energy-kcal_100g'] || 0),
        protein: Math.round((product.nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((product.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((product.nutriments['fat_100g'] || 0) * 10) / 10,
        sugar: Math.round((product.nutriments['sugars_100g'] || 0) * 10) / 10,
        fiber: Math.round((product.nutriments['fiber_100g'] || 0) * 10) / 10,
        sodium: Math.round((product.nutriments['sodium_100g'] || 0) * 1000) / 1000 // g
      },
      source: 'OpenFoodFacts',
      brandPriority: brand,
      country: 'Germany'
    }
  }

  async importTopGermanBrands(maxProducts = 10000): Promise<any[]> {
    console.log(`🇩🇪 Starting TOP GERMAN BRANDS import (max ${maxProducts} products)...`)
    
    const allProducts: any[] = []
    
    // Sortiere Marken nach Priorität (höchste zuerst)
    const sortedBrands = this.topGermanBrands.sort((a, b) => b.priority - a.priority)
    
    for (const brandConfig of sortedBrands) {
      if (allProducts.length >= maxProducts) break
      
      console.log(`🏷️ Processing brand: ${brandConfig.brand} (Priority: ${brandConfig.priority})`)
      
      try {
        let page = 1
        let brandProducts: any[] = []
        const maxPagesPerBrand = 10 // Begrenze Seiten pro Marke (erhöht für mehr Produkte)
        
        while (brandProducts.length < brandConfig.expectedProducts && page <= maxPagesPerBrand) {
          const response = await this.fetchProductsByBrand(brandConfig.brand, page, 50)
          
          if (!response.products || response.products.length === 0) {
            break // Keine weiteren Produkte
          }
          
          const validProducts = response.products
            .filter((p: any) => this.isValidProduct(p))
            .map((p: any) => this.normalizeProduct(p, brandConfig.brand))
            .slice(0, brandConfig.expectedProducts - brandProducts.length)
          
          brandProducts.push(...validProducts)
          
          if (validProducts.length === 0) {
            break // Keine validen Produkte mehr
          }
          
          page++
        }
        
        allProducts.push(...brandProducts)
        
        console.log(`✅ ${brandConfig.brand}: ${brandProducts.length} products collected (${allProducts.length} total)`)
        
        // Progress-Update alle 5 Marken
        if (sortedBrands.indexOf(brandConfig) % 5 === 0) {
          console.log(`📊 Progress: ${allProducts.length}/${maxProducts} products (${this.importedBarcodes.size} unique barcodes)`)
        }
        
      } catch (error) {
        console.error(`❌ Error processing brand ${brandConfig.brand}:`, error)
      }
    }
    
    console.log(`🎉 Brand import completed! Found ${allProducts.length} products from ${this.importedBarcodes.size} unique barcodes`)
    
    // Finale Statistiken
    const brandStats = allProducts.reduce((stats, product) => {
      stats[product.brand] = (stats[product.brand] || 0) + 1
      return stats
    }, {} as Record<string, number>)
    
    console.log('📊 Top imported brands:')
    Object.entries(brandStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`   ${brand}: ${count} products`)
      })
    
    return allProducts
  }

  // Deduplizierung basierend auf existierenden Produkten in der DB
  async checkExistingProducts(supabase: any): Promise<void> {
    console.log('🔍 Checking existing products to avoid duplicates...')
    
    try {
      const { data: existingProducts, error } = await supabase
        .from('products')
        .select('code')
      
      if (!error && existingProducts) {
        existingProducts.forEach((product: any) => {
          this.importedBarcodes.add(product.code)
        })
        
        console.log(`📋 Found ${existingProducts.length} existing products - will skip duplicates`)
      }
    } catch (error) {
      console.error('⚠️ Could not check existing products:', error)
    }
  }
}

export default EnhancedOpenFoodFactsImporter
