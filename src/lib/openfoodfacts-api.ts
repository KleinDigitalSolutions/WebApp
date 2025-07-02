// OpenFoodFacts API Integration für Barcode-basierte Produktsuche
interface OpenFoodFactsProduct {
  code: string
  product_name?: string
  brands?: string
  image_url?: string
  image_front_url?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    'fiber_100g'?: number
    'sugars_100g'?: number
    'salt_100g'?: number
    'sodium_100g'?: number
  }
  categories?: string
  countries_tags?: string[]
  stores?: string
  allergens_tags?: string[]
  nutrition_grades?: string
  ecoscore_grade?: string
  nova_group?: number
}

interface OpenFoodFactsResponse {
  status: number
  status_verbose: string
  product?: OpenFoodFactsProduct
}

export interface NormalizedProduct {
  code: string
  name: string
  brand: string
  image_url: string
  nutrition: {
    calories_per_100g: number
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    fiber_per_100g: number
    sugar_per_100g: number
    salt_per_100g: number
  }
  category?: string
  stores?: string[]
  allergens?: string[]
  nutrition_grade?: string
  eco_score?: string
  nova_group?: number
  source: 'openfoodfacts'
  country: 'germany' | 'international'
}

export class OpenFoodFactsAPI {
  private static readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2'
  private static readonly USER_AGENT = 'TrackFood/1.0 (contact@trackfood.app)'

  /**
   * Sucht Produkt per Barcode in OpenFoodFacts Datenbank
   * Fokus auf deutsche Produkte, aber internationale als Fallback
   */
  static async searchByBarcode(barcode: string): Promise<NormalizedProduct | null> {
    try {
      console.log(`🔍 OpenFoodFacts Suche für Barcode: ${barcode}`)

      const response = await fetch(`${this.BASE_URL}/product/${barcode}.json`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      })

      if (!response.ok) {
        console.error(`OpenFoodFacts API Error: ${response.status}`)
        return null
      }

      const data: OpenFoodFactsResponse = await response.json()

      if (data.status !== 1 || !data.product) {
        console.log(`❌ Produkt mit Barcode ${barcode} nicht in OpenFoodFacts gefunden`)
        return null
      }

      const product = data.product

      // Prüfe ob es ein deutsches Produkt ist
      const isGermanProduct = product.countries_tags?.some(tag => 
        tag.includes('germany') || tag.includes('deutschland') || tag.includes('de:')
      ) || false

      // Normalisiere Produktdaten
      const normalized = this.normalizeProduct(product, isGermanProduct)
      
      if (!normalized) {
        console.log(`⚠️ Produkt ${barcode} hat unvollständige Daten`)
        return null
      }

      console.log(`✅ Deutsches Produkt gefunden:`, normalized.name)
      return normalized

    } catch (error) {
      console.error('OpenFoodFacts API Fehler:', error)
      return null
    }
  }

  /**
   * Normalisiert OpenFoodFacts Produktdaten zu unserem einheitlichen Format
   */
  private static normalizeProduct(product: OpenFoodFactsProduct, isGerman: boolean): NormalizedProduct | null {
    // Mindestanforderungen prüfen
    if (!product.product_name || !product.code) {
      return null
    }

    // Nährstoffe extrahieren und validieren
    const nutriments = product.nutriments || {}
    
    const nutrition = {
      calories_per_100g: this.getSafeNumber(nutriments['energy-kcal_100g']),
      protein_per_100g: this.getSafeNumber(nutriments['proteins_100g']),
      carbs_per_100g: this.getSafeNumber(nutriments['carbohydrates_100g']),
      fat_per_100g: this.getSafeNumber(nutriments['fat_100g']),
      fiber_per_100g: this.getSafeNumber(nutriments['fiber_100g']),
      sugar_per_100g: this.getSafeNumber(nutriments['sugars_100g']),
      salt_per_100g: this.getSafeNumber(nutriments['salt_100g']) || 
                     this.getSafeNumber(nutriments['sodium_100g']) * 2.5 // Sodium zu Salz umrechnen
    }

    // Mindestens Kalorien müssen vorhanden sein
    if (nutrition.calories_per_100g === 0) {
      console.log(`⚠️ Produkt ${product.code} hat keine Nährstoffangaben`)
      return null
    }

    // Geschäfte extrahieren und deutsche Supermärkte identifizieren
    const stores = this.extractGermanStores(product.stores)

    // Allergene normalisieren
    const allergens = this.normalizeAllergens(product.allergens_tags || [])

    return {
      code: product.code,
      name: product.product_name.trim(),
      brand: product.brands?.split(',')[0]?.trim() || 'Unbekannte Marke',
      image_url: product.image_front_url || product.image_url || '',
      nutrition,
      category: this.normalizeCategory(product.categories),
      stores,
      allergens,
      nutrition_grade: product.nutrition_grades?.toUpperCase(),
      eco_score: product.ecoscore_grade?.toUpperCase(),
      nova_group: product.nova_group,
      source: 'openfoodfacts',
      country: isGerman ? 'germany' : 'international'
    }
  }

  /**
   * Sichere Zahlenextraktion mit Fallback auf 0
   */
  private static getSafeNumber(value: unknown): number {
    const num = typeof value === 'number' ? value : parseFloat(String(value) || '0')
    return isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100
  }

  /**
   * Extrahiert deutsche Supermärkte aus der Stores-Liste
   */
  private static extractGermanStores(storesString?: string): string[] {
    if (!storesString) return []

    const germanStores = ['rewe', 'edeka', 'aldi', 'lidl', 'penny', 'netto', 'dm', 'rossmann', 'kaufland', 'real']
    const stores: string[] = []

    const storesList = storesString.toLowerCase().split(',')
    
    for (const store of storesList) {
      const cleanStore = store.trim()
      for (const germanStore of germanStores) {
        if (cleanStore.includes(germanStore)) {
          stores.push(germanStore)
          break
        }
      }
    }

    return [...new Set(stores)] // Duplikate entfernen
  }

  /**
   * Normalisiert Allergene zu deutschen Bezeichnungen
   */
  private static normalizeAllergens(allergenTags: string[]): string[] {
    const allergenMap: Record<string, string> = {
      'en:milk': 'Milch',
      'en:eggs': 'Eier',
      'en:gluten': 'Gluten',
      'en:nuts': 'Nüsse',
      'en:peanuts': 'Erdnüsse',
      'en:soybeans': 'Soja',
      'en:fish': 'Fisch',
      'en:crustaceans': 'Krebstiere',
      'en:molluscs': 'Weichtiere',
      'en:sesame-seeds': 'Sesam',
      'en:sulphur-dioxide-and-sulphites': 'Sulfite',
      'en:celery': 'Sellerie',
      'en:mustard': 'Senf',
      'en:lupin': 'Lupinen'
    }

    const allergens: string[] = []
    
    for (const tag of allergenTags) {
      const german = allergenMap[tag]
      if (german) {
        allergens.push(german)
      }
    }

    return allergens
  }

  /**
   * Normalisiert Kategorie zu deutscher Bezeichnung
   */
  private static normalizeCategory(categories?: string): string | undefined {
    if (!categories) return undefined

    const categoryMap: Record<string, string> = {
      'milk': 'Milchprodukte',
      'dairy': 'Milchprodukte', 
      'bread': 'Brot & Backwaren',
      'bakery': 'Brot & Backwaren',
      'meat': 'Fleisch & Wurst',
      'fish': 'Fisch & Meeresfrüchte',
      'fruits': 'Obst',
      'vegetables': 'Gemüse',
      'beverages': 'Getränke',
      'snacks': 'Snacks',
      'chocolate': 'Süßwaren',
      'confectionery': 'Süßwaren',
      'frozen': 'Tiefkühlprodukte',
      'pasta': 'Nudeln & Teigwaren',
      'cereals': 'Getreideprodukte'
    }

    const lowerCategories = categories.toLowerCase()
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategories.includes(key)) {
        return value
      }
    }

    return 'Sonstiges'
  }

  /**
   * Batch-Suche für mehrere Barcodes (für zukünftige Erweiterungen)
   */
  static async searchMultipleBarcodes(barcodes: string[]): Promise<NormalizedProduct[]> {
    const results = await Promise.allSettled(
      barcodes.map(barcode => this.searchByBarcode(barcode))
    )

    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<NormalizedProduct>).value)
  }
}
