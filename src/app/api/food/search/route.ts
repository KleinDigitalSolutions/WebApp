import { NextRequest, NextResponse } from 'next/server'
import { OpenFoodFactsAPI } from '@/lib/openfoodfacts-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const openFoodFactsAPI = new OpenFoodFactsAPI()
    const products = await openFoodFactsAPI.searchProducts(query)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Food search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search food products' },
      { status: 500 }
    )
  }
}
