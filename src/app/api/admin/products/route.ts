import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Prüfe ob User Admin-Rechte hat (vereinfacht - in Produktion sollte das über Rollen erfolgen)
const ADMIN_EMAILS = [
  'admin@nutriwise.com',
  'moderator@nutriwise.com'
  // Hier können weitere Admin-E-Mails hinzugefügt werden
]

async function checkAdminAccess(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase.auth.admin.getUserById(userId)
  
  if (error || !user.user) {
    return false
  }
  
  return ADMIN_EMAILS.includes(user.user.email || '')
}

// GET - Alle Produkte zur Moderation abrufen
export async function GET(request: NextRequest) {
  try {
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

    // Prüfe Admin-Berechtigung
    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Admin-Berechtigung' },
        { status: 403 }
      )
    }

    // URL-Parameter für Filterung
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Hole Produkte basierend auf Status
    let query = supabase
      .from('products')
      .select(`
        *,
        created_by_profile:profiles!products_created_by_fkey(id),
        verified_by_profile:profiles!products_verified_by_fkey(id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status !== 'all') {
      query = query.eq('verification_status', status)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Fehler beim Abrufen der Produkte:', error)
      return NextResponse.json(
        { error: 'Fehler beim Abrufen der Produkte' },
        { status: 500 }
      )
    }

    // Statistiken abrufen
    const { data: stats } = await supabase
      .from('products')
      .select('verification_status')

    const statistics = {
      total: stats?.length || 0,
      pending: stats?.filter(p => p.verification_status === 'pending').length || 0,
      approved: stats?.filter(p => p.verification_status === 'approved').length || 0,
      rejected: stats?.filter(p => p.verification_status === 'rejected').length || 0
    }

    return NextResponse.json({
      products: products || [],
      statistics,
      pagination: {
        offset,
        limit,
        hasMore: (products?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('Fehler bei der Produktmoderation:', error)
    return NextResponse.json(
      { error: 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}

// PATCH - Produktstatus ändern (genehmigen/ablehnen)
export async function PATCH(request: NextRequest) {
  try {
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

    // Prüfe Admin-Berechtigung
    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Admin-Berechtigung' },
        { status: 403 }
      )
    }

    const { productId, status, moderatorNotes, isVerified } = await request.json()

    // Validiere Eingaben
    if (!productId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Ungültige Parameter' },
        { status: 400 }
      )
    }

    // Aktualisiere Produktstatus
    const updateData: Record<string, unknown> = {
      verification_status: status,
      verified_by: user.id,
      moderator_notes: moderatorNotes || null
    }

    if (status === 'approved') {
      updateData.is_verified = isVerified || false
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Fehler beim Aktualisieren des Produkts:', error)
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Produkts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Produkt wurde ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}`,
      product: updatedProduct
    })

  } catch (error) {
    console.error('Fehler bei der Produktmoderation:', error)
    return NextResponse.json(
      { error: 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}
