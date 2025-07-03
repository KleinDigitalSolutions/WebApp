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
    { brand: 'maggi', priority: 4, categories: ['sauces', 'soups'], expectedProducts: 35 },
    { brand: 'lorenz', priority: 4, categories: ['snacks'], expectedProducts: 30 },
    { brand: 'leibniz', priority: 4, categories: ['cookies'], expectedProducts: 20 },
    { brand: 'funny-frisch', priority: 4, categories: ['snacks'], expectedProducts: 25 },
    { brand: 'nivea', priority: 3, categories: ['cosmetics'], expectedProducts: 15 },
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
    // Tier 2: Absolute Top-Marken
    { brand: 'debeukelaer', priority: 4, categories: ['cookies', 'snacks'], expectedProducts: 15 },
    { brand: 'philadelphia', priority: 4, categories: ['dairy', 'cheese'], expectedProducts: 15 },
    { brand: 'mondelez', priority: 4, categories: ['snacks', 'chocolate'], expectedProducts: 20 },
    { brand: 'kraft-heinz', priority: 4, categories: ['sauces', 'ketchup'], expectedProducts: 15 },
    { brand: 'bärenmarke', priority: 4, categories: ['dairy', 'milk'], expectedProducts: 15 },
    { brand: 'zott', priority: 4, categories: ['dairy', 'yogurt'], expectedProducts: 15 },
    { brand: 'schwartau', priority: 4, categories: ['spreads', 'jam'], expectedProducts: 15 },
    { brand: 'brandt', priority: 4, categories: ['bread', 'snacks'], expectedProducts: 10 },
    { brand: 'golden-toast', priority: 3, categories: ['bread', 'toast'], expectedProducts: 10 },
    { brand: 'hengstenberg', priority: 3, categories: ['pickles', 'sauerkraut'], expectedProducts: 10 },
    { brand: 'spreewaldhof', priority: 3, categories: ['pickles', 'fruit'], expectedProducts: 10 },
    { brand: 'bonduelle', priority: 4, categories: ['vegetables', 'canned'], expectedProducts: 15 },
    { brand: 'meica', priority: 3, categories: ['meat', 'sausages'], expectedProducts: 10 },
    { brand: 'rügenwalder-mühle', priority: 4, categories: ['meat', 'vegan'], expectedProducts: 15 },
    { brand: 'tönnies', priority: 3, categories: ['meat'], expectedProducts: 10 },
    { brand: 'miree', priority: 3, categories: ['dairy', 'spreads'], expectedProducts: 10 },
    { brand: 'melitta', priority: 4, categories: ['coffee'], expectedProducts: 15 },
    { brand: 'tchibo', priority: 4, categories: ['coffee'], expectedProducts: 15 },
    { brand: 'lavazza', priority: 4, categories: ['coffee'], expectedProducts: 10 },
    { brand: 'teekanne', priority: 4, categories: ['tea'], expectedProducts: 15 },
    { brand: 'meßmer', priority: 4, categories: ['tea'], expectedProducts: 15 },
    { brand: 'volvic', priority: 3, categories: ['water'], expectedProducts: 10 },
    { brand: 'gerolsteiner', priority: 3, categories: ['water'], expectedProducts: 10 },
    { brand: 'vio', priority: 3, categories: ['water'], expectedProducts: 10 },
    { brand: 'apollinaris', priority: 3, categories: ['water'], expectedProducts: 10 },
    { brand: 'fritz-kola', priority: 3, categories: ['beverages', 'soft-drinks'], expectedProducts: 10 },
    { brand: 'club-mate', priority: 3, categories: ['beverages', 'soft-drinks'], expectedProducts: 10 },
    { brand: 'hohes-c', priority: 3, categories: ['beverages', 'juice'], expectedProducts: 10 },
    { brand: 'dennree', priority: 4, categories: ['bio', 'pantry'], expectedProducts: 15 },
    { brand: 'bioland', priority: 4, categories: ['bio', 'pantry'], expectedProducts: 10 },
    { brand: 'rapunzel', priority: 4, categories: ['bio', 'pantry'], expectedProducts: 10 },
    { brand: 'seitenbacher', priority: 4, categories: ['bio', 'muesli'], expectedProducts: 10 },
    { brand: 'exquisa', priority: 3, categories: ['dairy', 'cheese'], expectedProducts: 10 },
    { brand: 'buitoni', priority: 3, categories: ['pasta'], expectedProducts: 10 },
    { brand: 'saskia', priority: 3, categories: ['water'], expectedProducts: 10 },
    { brand: 'goldähren', priority: 3, categories: ['bread'], expectedProducts: 10 },
    { brand: 'hofburger', priority: 3, categories: ['dairy', 'cheese'], expectedProducts: 10 },
    { brand: 'milsani', priority: 3, categories: ['dairy'], expectedProducts: 10 },
    { brand: 'myvay', priority: 3, categories: ['vegan', 'dairy'], expectedProducts: 10 },
    { brand: 'westminster', priority: 3, categories: ['tea'], expectedProducts: 10 },
    { brand: 'gabower', priority: 3, categories: ['dairy'], expectedProducts: 10 },
    { brand: 'hochland', priority: 3, categories: ['dairy', 'cheese'], expectedProducts: 10 },
    { brand: 'président', priority: 3, categories: ['dairy', 'cheese'], expectedProducts: 10 },
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

  // Helper: Erzeugt für Marken mit Umlauten beide Varianten (Umlaut und Umschreibung)
  private expandBrandVariants(brand: string): string[] {
    const umlautMap: Record<string, string> = {
      'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
      'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue'
    }
    let variants = [brand]
    let replaced = brand
    Object.entries(umlautMap).forEach(([umlaut, ascii]) => {
      if (brand.includes(umlaut)) {
        replaced = replaced.replaceAll(umlaut, ascii)
      }
    })
    if (replaced !== brand) variants.push(replaced)
    // Auch Bindestrich-Varianten (z.B. rügenwalder-mühle vs ruegenwaldermuehle)
    if (replaced.includes('-')) {
      variants.push(replaced.replaceAll('-', ''))
    }
    return Array.from(new Set(variants))
  }

  async importTopGermanBrands(maxProducts = 10000): Promise<any[]> {
    console.log(`🇩🇪 Starting TOP GERMAN BRANDS import (max ${maxProducts} products)...`)
    const allProducts: any[] = []
    // Sortiere Marken nach Priorität (höchste zuerst)
    const sortedBrands = this.topGermanBrands.sort((a, b) => b.priority - a.priority)
    for (const brandConfig of sortedBrands) {
      if (allProducts.length >= maxProducts) break
      const brandVariants = this.expandBrandVariants(brandConfig.brand)
      for (const brandVariant of brandVariants) {
        console.log(`🏷️ Processing brand: ${brandVariant} (Priority: ${brandConfig.priority})`)
        try {
          let page = 1
          let brandProducts: any[] = []
          const maxPagesPerBrand = 10
          while (brandProducts.length < brandConfig.expectedProducts && page <= maxPagesPerBrand) {
            const response = await this.fetchProductsByBrand(brandVariant, page, 50)
            if (!response.products || response.products.length === 0) break
            const validProducts = response.products
              .filter((p: any) => this.isValidProduct(p))
              .map((p: any) => this.normalizeProduct(p, brandVariant))
              .slice(0, brandConfig.expectedProducts - brandProducts.length)
            brandProducts.push(...validProducts)
            if (validProducts.length === 0) break
            page++
          }
          allProducts.push(...brandProducts)
          console.log(`✅ ${brandVariant}: ${brandProducts.length} products collected (${allProducts.length} total)`)
          if (sortedBrands.indexOf(brandConfig) % 5 === 0) {
            console.log(`📊 Progress: ${allProducts.length}/${maxProducts} products (${this.importedBarcodes.size} unique barcodes)`)
          }
        } catch (error) {
          console.error(`❌ Error processing brand ${brandVariant}:`, error)
        }
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
