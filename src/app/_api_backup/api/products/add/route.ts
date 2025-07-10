import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Prüfe Authentifizierung
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich' },
        { status: 401 }
      )
    }

    // Extrahiere Token und verifiziere User
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Ungültiger Authentifizierungstoken' },
        { status: 401 }
      )
    }

    const productData = await request.json()

    // Validiere erforderliche Felder
    const requiredFields = [
      'name', 'brand', 'category', 'calories_per_100g',
      'protein_per_100g', 'carbs_per_100g', 'fat_per_100g'
    ]

    for (const field of requiredFields) {
      if (!productData[field] && productData[field] !== 0) {
        return NextResponse.json(
          { error: `Feld '${field}' ist erforderlich` },
          { status: 400 }
        )
      }
    }

    // Generiere eindeutigen Code
    const code = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Erstelle Produkt-Objekt
    const newProduct = {
      code,
      name: productData.name.trim(),
      brand: productData.brand.trim(),
      category: productData.category,
      supermarkets: productData.supermarkets || [],
      price_min: productData.price_min || null,
      price_max: productData.price_max || null,
      image_url: productData.image_url || null,
      
      // Nährwerte pro 100g
      calories_per_100g: parseFloat(productData.calories_per_100g),
      protein_per_100g: parseFloat(productData.protein_per_100g),
      carbs_per_100g: parseFloat(productData.carbs_per_100g),
      fat_per_100g: parseFloat(productData.fat_per_100g),
      fiber_per_100g: productData.fiber_per_100g ? parseFloat(productData.fiber_per_100g) : null,
      sugar_per_100g: productData.sugar_per_100g ? parseFloat(productData.sugar_per_100g) : null,
      salt_per_100g: productData.salt_per_100g ? parseFloat(productData.salt_per_100g) : null,
      
      allergens: productData.allergens || [],
      keywords: productData.keywords || [],
      
      created_by: user.id,
      is_verified: false,
      is_community_product: true,
      verification_status: 'pending'
    }

    // Validiere Nährwerte
    if (newProduct.calories_per_100g < 0 || newProduct.calories_per_100g > 1000) {
      return NextResponse.json(
        { error: 'Kalorien müssen zwischen 0 und 1000 pro 100g liegen' },
        { status: 400 }
      )
    }

    if (newProduct.protein_per_100g < 0 || newProduct.protein_per_100g > 100) {
      return NextResponse.json(
        { error: 'Protein muss zwischen 0 und 100g pro 100g liegen' },
        { status: 400 }
      )
    }

    if (newProduct.carbs_per_100g < 0 || newProduct.carbs_per_100g > 100) {
      return NextResponse.json(
        { error: 'Kohlenhydrate müssen zwischen 0 und 100g pro 100g liegen' },
        { status: 400 }
      )
    }

    if (newProduct.fat_per_100g < 0 || newProduct.fat_per_100g > 100) {
      return NextResponse.json(
        { error: 'Fett muss zwischen 0 und 100g pro 100g liegen' },
        { status: 400 }
      )
    }

    // Prüfe ob bereits ein ähnliches Produkt existiert
    const { data: existingProducts, error: searchError } = await supabase
      .from('products')
      .select('id, name, brand')
      .ilike('name', `%${newProduct.name}%`)
      .ilike('brand', `%${newProduct.brand}%`)

    if (searchError) {
      console.error('Fehler bei der Duplikatsprüfung:', searchError)
    }

    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Ein ähnliches Produkt existiert bereits',
          existing_products: existingProducts
        },
        { status: 409 }
      )
    }

    // Füge Produkt zur Datenbank hinzu
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single()

    if (insertError) {
      console.error('Fehler beim Hinzufügen des Produkts:', insertError)
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Produkts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Produkt erfolgreich hinzugefügt und wartet auf Überprüfung',
      product: insertedProduct,
      status: 'pending_approval'
    }, { status: 201 })

  } catch (error) {
    console.error('Fehler beim Hinzufügen des Produkts:', error)
    return NextResponse.json(
      { error: 'Unbekannter Fehler beim Hinzufügen des Produkts' },
      { status: 500 }
    )
  }
}

// GET-Route um eigene hinzugefügte Produkte anzuzeigen
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Ungültiger Authentifizierungstoken' },
        { status: 401 }
      )
    }

    const { data: userProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Abrufen der Benutzerprodukte:', error)
      return NextResponse.json(
        { error: 'Fehler beim Abrufen der Produkte' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: userProducts,
      total: userProducts.length
    })

  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzerprodukte:', error)
    return NextResponse.json(
      { error: 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}
