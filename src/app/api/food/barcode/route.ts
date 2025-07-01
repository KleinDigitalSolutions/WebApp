import { NextRequest, NextResponse } from 'next/server'
import { OpenFoodFactsAPI } from '@/lib/openfoodfacts-api'
import { GermanProductDatabase } from '@/lib/german-product-database'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get('barcode')

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode ist erforderlich' },
        { status: 400 }
      )
    }

    // Validiere Barcode Format (EAN-13 oder EAN-8)
    if (!/^\d{8}$|^\d{13}$/.test(barcode)) {
      return NextResponse.json(
        { error: 'Ungültiges Barcode-Format. Nur EAN-8 oder EAN-13 unterstützt.' },
        { status: 400 }
      )
    }

    console.log(`🔍 Barcode Lookup für: ${barcode}`)

    // Schritt 1: Suche in lokaler deutscher Produktdatenbank
    const localProduct = GermanProductDatabase.findByBarcode(barcode)
    if (localProduct) {
      console.log(`✅ Lokales deutsches Produkt gefunden: ${localProduct.name}`)
      
      const normalized = {
        code: localProduct.code,
        name: localProduct.name,
        brand: localProduct.brand,
        image_url: localProduct.image_url || '',
        nutrition: {
          calories_per_100g: localProduct.nutrition.calories_per_100g,
          protein_per_100g: localProduct.nutrition.protein_per_100g,
          carbs_per_100g: localProduct.nutrition.carbs_per_100g,
          fat_per_100g: localProduct.nutrition.fat_per_100g,
          fiber_per_100g: localProduct.nutrition.fiber_per_100g || 0,
          sugar_per_100g: localProduct.nutrition.sugar_per_100g || 0,
          salt_per_100g: localProduct.nutrition.salt_per_100g || 0
        },
        category: localProduct.category,
        stores: localProduct.supermarkets,
        allergens: localProduct.allergens || [],
        source: 'local_german_db',
        country: 'germany'
      }

      return NextResponse.json({
        success: true,
        product: normalized,
        source: 'local_german_database'
      })
    }

    // Schritt 2: Suche in Supabase für community-hinzugefügte Produkte
    const supabase = getSupabaseClient()
    const { data: supabaseProduct, error } = await supabase
      .from('products')
      .select('*')
      .eq('code', barcode)
      .eq('verification_status', 'approved')
      .single()

    if (!error && supabaseProduct) {
      console.log(`✅ Community Produkt gefunden: ${supabaseProduct.name}`)
      
      const normalized = {
        code: supabaseProduct.code,
        name: supabaseProduct.name,
        brand: supabaseProduct.brand,
        image_url: supabaseProduct.image_url || '',
        nutrition: {
          calories_per_100g: supabaseProduct.calories_per_100g,
          protein_per_100g: supabaseProduct.protein_per_100g,
          carbs_per_100g: supabaseProduct.carbs_per_100g,
          fat_per_100g: supabaseProduct.fat_per_100g,
          fiber_per_100g: supabaseProduct.fiber_per_100g || 0,
          sugar_per_100g: supabaseProduct.sugar_per_100g || 0,
          salt_per_100g: supabaseProduct.salt_per_100g || 0
        },
        category: supabaseProduct.category,
        stores: supabaseProduct.supermarkets || [],
        allergens: supabaseProduct.allergens || [],
        source: 'community',
        country: 'germany'
      }

      return NextResponse.json({
        success: true,
        product: normalized,
        source: 'community_database'
      })
    }

    // Schritt 3: Suche in OpenFoodFacts (internationale Datenbank)
    const offProduct = await OpenFoodFactsAPI.searchByBarcode(barcode)
    if (offProduct) {
      console.log(`✅ OpenFoodFacts Produkt gefunden: ${offProduct.name}`)
      
      // Speichere gefundenes Produkt in lokaler DB für zukünftige Suchen
      try {
        await supabase
          .from('products')
          .insert({
            code: offProduct.code,
            name: offProduct.name,
            brand: offProduct.brand,
            category: offProduct.category || 'Sonstiges',
            calories_per_100g: offProduct.nutrition.calories_per_100g,
            protein_per_100g: offProduct.nutrition.protein_per_100g,
            carbs_per_100g: offProduct.nutrition.carbs_per_100g,
            fat_per_100g: offProduct.nutrition.fat_per_100g,
            fiber_per_100g: offProduct.nutrition.fiber_per_100g,
            sugar_per_100g: offProduct.nutrition.sugar_per_100g,
            salt_per_100g: offProduct.nutrition.salt_per_100g,
            image_url: offProduct.image_url,
            supermarkets: offProduct.stores,
            allergens: offProduct.allergens,
            verification_status: 'approved',
            created_by: 'openfoodfacts_import',
            is_verified: true,
            source: 'openfoodfacts'
          })
        console.log(`💾 Produkt ${barcode} in lokale DB gespeichert`)
      } catch (saveError) {
        console.error('Fehler beim Speichern in lokale DB:', saveError)
        // Fehler beim Speichern soll die Antwort nicht blockieren
      }

      return NextResponse.json({
        success: true,
        product: offProduct,
        source: 'openfoodfacts'
      })
    }

    // Schritt 4: Kein Produkt gefunden
    console.log(`❌ Kein Produkt für Barcode ${barcode} gefunden`)
    
    return NextResponse.json({
      success: false,
      message: 'Produkt nicht gefunden',
      barcode,
      suggestions: [
        'Überprüfe ob der Barcode korrekt gescannt wurde',
        'Das Produkt ist möglicherweise nicht in unserer Datenbank',
        'Du kannst das Produkt manuell hinzufügen'
      ]
    }, { status: 404 })

  } catch (error) {
    console.error('Fehler bei Barcode-Suche:', error)
    
    return NextResponse.json(
      { 
        error: 'Interner Server-Fehler bei der Barcode-Suche',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    )
  }
}

// POST Route für manuelles Hinzufügen von Produkten per Barcode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barcode, name, brand, nutrition, category, image_url } = body

    if (!barcode || !name || !nutrition) {
      return NextResponse.json(
        { error: 'Barcode, Name und Nährstoffe sind erforderlich' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Prüfe ob Produkt bereits existiert
    const { data: existing } = await supabase
      .from('products')
      .select('code')
      .eq('code', barcode)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Produkt mit diesem Barcode existiert bereits' },
        { status: 409 }
      )
    }

    // Füge neues Produkt hinzu
    const { data, error } = await supabase
      .from('products')
      .insert({
        code: barcode,
        name,
        brand: brand || 'Unbekannte Marke',
        category: category || 'Sonstiges',
        calories_per_100g: nutrition.calories_per_100g,
        protein_per_100g: nutrition.protein_per_100g,
        carbs_per_100g: nutrition.carbs_per_100g,
        fat_per_100g: nutrition.fat_per_100g,
        fiber_per_100g: nutrition.fiber_per_100g || 0,
        sugar_per_100g: nutrition.sugar_per_100g || 0,
        salt_per_100g: nutrition.salt_per_100g || 0,
        image_url: image_url || '',
        verification_status: 'pending',
        created_by: 'user_manual',
        is_verified: false,
        source: 'user_input'
      })
      .select()
      .single()

    if (error) {
      console.error('Fehler beim Hinzufügen des Produkts:', error)
      return NextResponse.json(
        { error: 'Fehler beim Hinzufügen des Produkts' },
        { status: 500 }
      )
    }

    console.log(`✅ Neues Produkt hinzugefügt: ${name} (${barcode})`)

    return NextResponse.json({
      success: true,
      message: 'Produkt erfolgreich hinzugefügt',
      product: data
    })

  } catch (error) {
    console.error('Fehler beim Hinzufügen des Produkts:', error)
    
    return NextResponse.json(
      { 
        error: 'Interner Server-Fehler',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    )
  }
}
