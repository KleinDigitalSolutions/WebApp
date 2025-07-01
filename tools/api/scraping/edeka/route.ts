import { NextRequest, NextResponse } from 'next/server'
import EdekaScraper from '@/lib/edeka-scraper'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const maxProducts = parseInt(searchParams.get('max') || '10')
    const testOnly = searchParams.get('test') === 'true'
    
    console.log('🧪 Starting Edeka scraper test...')
    
    const scraper = new EdekaScraper()
    
    if (testOnly) {
      // Nur Verbindung testen
      const connectionOk = await scraper.testConnection()
      
      if (connectionOk) {
        // Kategorien finden
        const categories = await scraper.findProductCategories()
        
        return NextResponse.json({
          success: true,
          message: 'Edeka connection successful!',
          categoriesFound: categories.length,
          categories: categories.slice(0, 5),
          recommendation: 'Ready for product scraping!'
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'Edeka bot detection active',
          recommendation: 'Try again later or use different approach'
        }, { status: 429 })
      }
    } else {
      // Tatsächlich Produkte scrapen
      const products = await scraper.scrapeProducts(maxProducts)
      
      return NextResponse.json({
        success: true,
        message: `Successfully scraped ${products.length} products from Edeka`,
        products,
        stats: {
          totalProducts: products.length,
          withNutrition: products.filter(p => p.nutritionPer100g).length,
          withBarcodes: products.filter(p => p.barcode).length,
          categories: [...new Set(products.map(p => p.category))].length
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Edeka scraper error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: 'Bot detection likely active. Try different approach or timing.'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json()
    
    if (!Array.isArray(products)) {
      return NextResponse.json({
        success: false,
        error: 'Products array required'
      }, { status: 400 })
    }
    
    // TODO: Hier würden wir die Produkte in Supabase speichern
    console.log(`💾 Would save ${products.length} products to database`)
    
    return NextResponse.json({
      success: true,
      message: `Would save ${products.length} products to database`,
      savedProducts: products.length
    })
    
  } catch (error) {
    console.error('❌ Error saving products:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
