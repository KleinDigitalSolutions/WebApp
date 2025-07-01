import { NextRequest, NextResponse } from 'next/server'
import { OpenFoodFactsAPI } from '@/lib/openfoodfacts-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Suchbegriff ist erforderlich' },
        { status: 400 }
      )
    }

    console.log(`Food search request for: "${query}"`)

    // Search from OpenFoodFacts
    const openFoodFactsAPI = new OpenFoodFactsAPI()
    const products = await openFoodFactsAPI.searchProducts(query)

    console.log(`Found ${products.length} products for: "${query}"`)

    // Sort by relevance (products with names that match the query more closely)
    const sortedProducts = products.sort((a, b) => {
      const aNameLower = a.product_name.toLowerCase()
      const bNameLower = b.product_name.toLowerCase()
      const queryLower = query.toLowerCase()
      
      // Exact matches first
      if (aNameLower.includes(queryLower) && !bNameLower.includes(queryLower)) return -1
      if (!aNameLower.includes(queryLower) && bNameLower.includes(queryLower)) return 1
      
      // Then by how early the match appears
      const aIndex = aNameLower.indexOf(queryLower)
      const bIndex = bNameLower.indexOf(queryLower)
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      
      return 0
    })

    return NextResponse.json({ 
      products: sortedProducts.slice(0, 20),
      total: sortedProducts.length 
    })
  } catch (error) {
    console.error('Food search API error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Suchen von Lebensmitteln' },
      { status: 500 }
    )
  }
}
