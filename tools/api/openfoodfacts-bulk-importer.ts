// OpenFoodFacts Bulk-Importer für deutsche Produkte
// Sicherer und legaler Weg zu 1000+ Produkten

interface OpenFoodFactsProduct {
  code: string // Barcode
  product_name: string
  brands?: string
  categories?: string
  nutrition_data_per?: string // "100g"
  nutriments?: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    'sugars_100g'?: number
    'fiber_100g'?: number
    'sodium_100g'?: number
  }
  image_url?: string
  product_quantity?: string
  serving_size?: string
}

interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[]
  count: number
  page_count: number
  page_size: number
}

class OpenFoodFactsBulkImporter {
  private baseUrl = 'https://world.openfoodfacts.org'
  private delay = 1000 // 1 Sekunde zwischen Requests (respektvoll)
  
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fetchProductsByCategory(category: string, page = 1, pageSize = 100): Promise<OpenFoodFactsResponse> {
    const params = new URLSearchParams({
      'countries_tags_en': 'germany',
      'categories_tags_en': category,
      'fields': 'code,product_name,brands,categories,nutrition_data_per,nutriments,image_url,product_quantity,serving_size',
      'page': page.toString(),
      'page_size': pageSize.toString()
    })

    const url = `${this.baseUrl}/api/v0/search?${params}`
    
    console.log(`🔍 Fetching OpenFoodFacts: ${category} (page ${page})`)
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Rate Limiting
      await this.sleep(this.delay)
      
      return data
    } catch (error) {
      console.error(`❌ Error fetching category ${category}:`, error)
      throw error
    }
  }

  async importGermanProducts(maxProducts = 1000): Promise<any[]> {
    console.log(`🇩🇪 Starting German products import (max ${maxProducts})...`)
    
    // Wichtige deutsche Kategorien
    const categories = [
      'breakfasts',           // Frühstück
      'dairy',                // Milchprodukte  
      'beverages',            // Getränke
      'snacks',               // Snacks
      'bread',                // Brot
      'meat',                 // Fleisch
      'fruits',               // Obst
      'vegetables',           // Gemüse
      'cereals',              // Getreide
      'chocolate',            // Schokolade
      'yogurts',              // Joghurt
      'cheese',               // Käse
      'pasta',                // Nudeln
      'cookies',              // Kekse
      'spreads'               // Aufstriche
    ]
    
    const allProducts: any[] = []
    const productsPerCategory = Math.ceil(maxProducts / categories.length)
    
    for (const category of categories) {
      if (allProducts.length >= maxProducts) break
      
      console.log(`📂 Processing category: ${category}`)
      
      try {
        // Erste Seite laden
        const response = await this.fetchProductsByCategory(category, 1, productsPerCategory)
        
        for (const product of response.products) {
          if (allProducts.length >= maxProducts) break
          
          // Nur Produkte mit Nährwerten und Barcode
          if (product.code && 
              product.product_name && 
              product.nutrition_data_per === '100g' &&
              product.nutriments) {
            
            const processedProduct = {
              name: product.product_name,
              brand: product.brands || null,
              barcode: product.code,
              category: category,
              imageUrl: product.image_url || null,
              nutritionPer100g: {
                calories: product.nutriments['energy-kcal_100g'] || 0,
                protein: product.nutriments['proteins_100g'] || 0,
                carbs: product.nutriments['carbohydrates_100g'] || 0,
                fat: product.nutriments['fat_100g'] || 0,
                sugar: product.nutriments['sugars_100g'] || 0,
                fiber: product.nutriments['fiber_100g'] || 0,
                sodium: product.nutriments['sodium_100g'] || 0
              },
              source: 'OpenFoodFacts',
              country: 'Germany'
            }
            
            allProducts.push(processedProduct)
            
            if (allProducts.length % 50 === 0) {
              console.log(`✅ Processed ${allProducts.length} products...`)
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing category ${category}:`, error)
        // Weiter mit nächster Kategorie
      }
    }
    
    console.log(`🎉 Import completed! Found ${allProducts.length} German products`)
    
    // Statistiken
    const stats = {
      totalProducts: allProducts.length,
      categoriesUsed: [...new Set(allProducts.map(p => p.category))].length,
      brandsFound: [...new Set(allProducts.map(p => p.brand).filter(Boolean))].length,
      withImages: allProducts.filter(p => p.imageUrl).length,
      avgCalories: Math.round(
        allProducts.reduce((sum, p) => sum + p.nutritionPer100g.calories, 0) / allProducts.length
      )
    }
    
    console.log('📊 Import Statistics:', stats)
    
    return allProducts
  }

  // Spezifische Kategorien für deutsche Supermärkte
  async importSupermarketEssentials(maxProducts = 500): Promise<any[]> {
    console.log('🛒 Importing German supermarket essentials...')
    
    const supermarketCategories = [
      // Grundnahrungsmittel
      'milk',
      'bread', 
      'butter',
      'eggs',
      'yogurt',
      
      // Beliebte deutsche Produkte
      'sauerkraut',
      'sausages',
      'pretzels',
      'beer',
      'mineral-water',
      
      // Häufig gescannte Produkte
      'chocolate',
      'coffee',
      'breakfast-cereals',
      'pasta',
      'tomato-sauces'
    ]
    
    const products: any[] = []
    const productsPerCategory = Math.ceil(maxProducts / supermarketCategories.length)
    
    for (const category of supermarketCategories) {
      if (products.length >= maxProducts) break
      
      try {
        const response = await this.fetchProductsByCategory(category, 1, productsPerCategory)
        
        // Nur hochwertige Produkte mit vollständigen Daten
        const qualityProducts = response.products.filter(p => 
          p.code && 
          p.product_name && 
          p.nutrition_data_per === '100g' &&
          p.nutriments &&
          p.product_name.length > 3 &&
          !p.product_name.toLowerCase().includes('test')
        )
        
        products.push(...qualityProducts.slice(0, productsPerCategory).map(p => ({
          name: p.product_name,
          brand: p.brands || null,
          barcode: p.code,
          category,
          imageUrl: p.image_url || null,
          nutritionPer100g: {
            calories: p.nutriments?.['energy-kcal_100g'] || 0,
            protein: p.nutriments?.['proteins_100g'] || 0,
            carbs: p.nutriments?.['carbohydrates_100g'] || 0,
            fat: p.nutriments?.['fat_100g'] || 0,
            sugar: p.nutriments?.['sugars_100g'] || 0,
            fiber: p.nutriments?.['fiber_100g'] || 0,
            sodium: p.nutriments?.['sodium_100g'] || 0
          },
          source: 'OpenFoodFacts',
          country: 'Germany'
        })))
        
      } catch (error) {
        console.error(`❌ Error importing ${category}:`, error)
      }
    }
    
    console.log(`🎉 Imported ${products.length} supermarket essentials`)
    return products
  }
}

export default OpenFoodFactsBulkImporter
export type { OpenFoodFactsProduct }
