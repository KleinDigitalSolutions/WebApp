import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function listCategories() {
  const { data, error } = await supabase
    .from('recipes')
    .select('category')
    .neq('category', null)

  if (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
    process.exit(1)
  }

  const categories = Array.from(new Set(data.map((r: { category: string }) => r.category))).sort()
  console.log('Gefundene Kategorien in Supabase:')
  categories.forEach((cat) => console.log('-', cat))
}

listCategories()
