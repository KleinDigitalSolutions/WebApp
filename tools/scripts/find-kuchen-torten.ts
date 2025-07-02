import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function findKuchenTorten() {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, category')
    .or("category.ilike.%kuchen%,category.ilike.%torte%")

  if (error) {
    console.error('Fehler bei der Suche:', error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('Keine Rezepte mit Kategorie "Kuchen" oder "Torte" gefunden.')
    return
  }

  console.log('Gefundene Rezepte mit Kategorie "Kuchen" oder "Torte":')
  data.forEach((r: { id: string, title: string, category: string }) => {
    console.log(`- [${r.category}] ${r.title}`)
  })
}

findKuchenTorten()
