// Edeka Produktdaten-Scraper
// Vorsichtiges Scraping mit respektvollen Rate Limits

import * as cheerio from 'cheerio'

interface EdekaProduct {
  name: string
  brand?: string
  barcode?: string
  price?: string
  category?: string
  nutritionPer100g?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sugar?: number
    fiber?: number
    sodium?: number
  }
  imageUrl?: string
  productUrl: string
}

class EdekaScraper {
  private baseUrl = 'https://www.edeka.de'
  private delay = 3000 // 3 Sekunden zwischen Requests (respektvoll!)
  
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async fetchWithDelay(url: string): Promise<string> {
    console.log(`🔍 Fetching: ${url}`)
    
    // Respektvolle Headers (sieht aus wie echter Browser)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }

    try {
      const response = await fetch(url, { 
        headers,
        method: 'GET'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      
      // Rate Limiting - warten zwischen Requests
      await this.sleep(this.delay)
      
      return html
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Edeka connection...')
      const html = await this.fetchWithDelay('https://www.edeka.de')
      
      // Prüfen ob Bot-Detection aktiv ist
      if (html.includes('cloudflare') || 
          html.includes('captcha') || 
          html.includes('bot') ||
          html.length < 1000) {
        console.log('🚫 Bot detection detected!')
        return false
      }
      
      console.log('✅ Edeka connection successful!')
      return true
    } catch (error) {
      console.error('❌ Edeka connection failed:', error)
      return false
    }
  }

  async findProductCategories(): Promise<string[]> {
    try {
      console.log('📂 Searching for product categories...')
      const html = await this.fetchWithDelay('https://www.edeka.de')
      const $ = cheerio.load(html)
      
      const categories: string[] = []
      
      // Typische Kategorie-Selektoren suchen
      const categorySelectors = [
        'nav a[href*="/sortiment"]',
        'a[href*="/kategorie"]',
        'a[href*="/produkte"]',
        '.category-link',
        '.navigation a'
      ]
      
      categorySelectors.forEach(selector => {
        $(selector).each((_, element) => {
          const href = $(element).attr('href')
          const text = $(element).text().trim()
          
          if (href && text && (href.includes('/sortiment') || href.includes('/kategorie'))) {
            categories.push(href.startsWith('http') ? href : this.baseUrl + href)
          }
        })
      })
      
      const uniqueCategories = [...new Set(categories)]
      console.log(`📂 Found ${uniqueCategories.length} categories:`)
      uniqueCategories.slice(0, 5).forEach(cat => console.log(`  - ${cat}`))
      
      return uniqueCategories
    } catch (error) {
      console.error('❌ Error finding categories:', error)
      return []
    }
  }

  async scrapeProductsFromCategory(categoryUrl: string, maxProducts = 10): Promise<EdekaProduct[]> {
    try {
      console.log(`🛒 Scraping products from: ${categoryUrl}`)
      const html = await this.fetchWithDelay(categoryUrl)
      const $ = cheerio.load(html)
      
      const products: EdekaProduct[] = []
      
      // Verschiedene Produkt-Selektoren probieren
      const productSelectors = [
        '.product-item',
        '.product-card',
        '.product',
        '.article',
        '[data-product]'
      ]
      
      for (const selector of productSelectors) {
        const productElements = $(selector)
        
        if (productElements.length > 0) {
          console.log(`✅ Found products with selector: ${selector}`)
          
          productElements.slice(0, maxProducts).each((_, element) => {
            const $product = $(element)
            
            // Produktdaten extrahieren
            const name = $product.find('h2, h3, .product-name, .title').first().text().trim()
            const brand = $product.find('.brand, .manufacturer').first().text().trim()
            const price = $product.find('.price, .amount').first().text().trim()
            const imageUrl = $product.find('img').first().attr('src')
            const productLink = $product.find('a').first().attr('href')
            
            if (name && productLink) {
              const product: EdekaProduct = {
                name,
                brand: brand || undefined,
                price: price || undefined,
                imageUrl: imageUrl?.startsWith('http') ? imageUrl : 
                         imageUrl ? this.baseUrl + imageUrl : undefined,
                productUrl: productLink.startsWith('http') ? productLink : this.baseUrl + productLink,
                category: categoryUrl
              }
              
              products.push(product)
            }
          })
          
          break // Ersten funktionierenden Selector verwenden
        }
      }
      
      console.log(`📦 Scraped ${products.length} products from category`)
      return products
    } catch (error) {
      console.error(`❌ Error scraping category ${categoryUrl}:`, error)
      return []
    }
  }

  async scrapeProductDetails(productUrl: string): Promise<Partial<EdekaProduct>> {
    try {
      console.log(`🔍 Scraping product details: ${productUrl}`)
      const html = await this.fetchWithDelay(productUrl)
      const $ = cheerio.load(html)
      
      const details: Partial<EdekaProduct> = {}
      
      // Nährwerte suchen
      const nutritionSelectors = [
        '.nutrition-table',
        '.nutritional-values',
        '.nutrition-facts',
        '.product-nutrition'
      ]
      
      nutritionSelectors.forEach(selector => {
        $(selector).find('tr, .nutrition-row').each((_, row) => {
          const $row = $(row)
          const label = $row.find('td:first, .label').text().toLowerCase().trim()
          const value = $row.find('td:last, .value').text().trim()
          
          // Deutsche Nährwert-Labels
          if (label.includes('energie') || label.includes('kalorien')) {
            const calories = parseFloat(value.match(/(\d+)/)?.[1] || '0')
            if (!details.nutritionPer100g) details.nutritionPer100g = {}
            details.nutritionPer100g.calories = calories
          } else if (label.includes('eiweiß') || label.includes('protein')) {
            const protein = parseFloat(value.match(/(\d+\.?\d*)/)?.[1] || '0')
            if (!details.nutritionPer100g) details.nutritionPer100g = {}
            details.nutritionPer100g.protein = protein
          } else if (label.includes('kohlenhydrate')) {
            const carbs = parseFloat(value.match(/(\d+\.?\d*)/)?.[1] || '0')
            if (!details.nutritionPer100g) details.nutritionPer100g = {}
            details.nutritionPer100g.carbs = carbs
          } else if (label.includes('fett')) {
            const fat = parseFloat(value.match(/(\d+\.?\d*)/)?.[1] || '0')
            if (!details.nutritionPer100g) details.nutritionPer100g = {}
            details.nutritionPer100g.fat = fat
          } else if (label.includes('zucker')) {
            const sugar = parseFloat(value.match(/(\d+\.?\d*)/)?.[1] || '0')
            if (!details.nutritionPer100g) details.nutritionPer100g = {}
            details.nutritionPer100g.sugar = sugar
          }
        })
      })
      
      // Barcode/EAN suchen
      const possibleBarcodes = html.match(/\d{13}/g) || html.match(/\d{8}/g)
      if (possibleBarcodes && possibleBarcodes.length > 0) {
        details.barcode = possibleBarcodes[0]
      }
      
      return details
    } catch (error) {
      console.error(`❌ Error scraping product details:`, error)
      return {}
    }
  }

  async scrapeProducts(maxProducts = 50): Promise<EdekaProduct[]> {
    console.log(`🚀 Starting Edeka scraping (max ${maxProducts} products)...`)
    
    // Zuerst Verbindung testen
    const connectionOk = await this.testConnection()
    if (!connectionOk) {
      throw new Error('❌ Edeka connection failed - Bot detection active?')
    }
    
    // Kategorien finden
    const categories = await this.findProductCategories()
    if (categories.length === 0) {
      throw new Error('❌ No categories found')
    }
    
    const allProducts: EdekaProduct[] = []
    const productsPerCategory = Math.ceil(maxProducts / Math.min(categories.length, 5))
    
    // Maximal 5 Kategorien durchgehen
    for (const category of categories.slice(0, 5)) {
      if (allProducts.length >= maxProducts) break
      
      console.log(`📂 Processing category: ${category}`)
      const products = await this.scrapeProductsFromCategory(category, productsPerCategory)
      
      // Details für jeden Product scrapen (nur erste 3 pro Kategorie)
      for (const product of products.slice(0, 3)) {
        if (allProducts.length >= maxProducts) break
        
        const details = await this.scrapeProductDetails(product.productUrl)
        const enrichedProduct = { ...product, ...details }
        allProducts.push(enrichedProduct)
        
        console.log(`✅ Scraped: ${enrichedProduct.name}`)
      }
    }
    
    console.log(`🎉 Edeka scraping completed! Found ${allProducts.length} products`)
    return allProducts
  }
}

export default EdekaScraper
export type { EdekaProduct }
