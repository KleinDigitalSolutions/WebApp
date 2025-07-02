// Script: debug-list-all-recipe-fields.ts
// Zweck: Listet alle Kategorien und alle Titel aus der Supabase-DB, um die tatsächlichen Werte zu debuggen.

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, category')
    .order('category', { ascending: true })

  if (error) {
    console.error('Fehler beim Laden:', error)
    process.exit(1)
  }

  const categories = Array.from(new Set(data.map((r: any) => r.category).filter(Boolean))).sort()
  console.log('Alle Kategorien:')
  for (const cat of categories) {
    console.log('-', cat)
  }
  console.log('\nBeispiel-Titel pro Kategorie:')
  for (const cat of categories) {
    const titles = data.filter((r: any) => r.category === cat).map((r: any) => r.title)
    console.log(`\nKategorie: ${cat}`)
    for (const t of titles.slice(0, 5)) {
      console.log('  -', t)
    }
  }
}

main()
