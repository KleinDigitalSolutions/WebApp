// tools/scripts/list-categories.ts
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key für Lesezugriff
)

async function main() {
  let all: string[] = []
  let from = 0
  const batch = 1000
  while (true) {
    const { data, error } = await supabase
      .from('recipes')
      .select('category')
      .neq('category', null)
      .range(from, from + batch - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all = all.concat(data.map((r: { category: string }) => r.category?.trim()).filter(Boolean))
    if (data.length < batch) break
    from += batch
  }
  const unique = Array.from(new Set(all))
  console.log('Kategorien in der Datenbank:')
  for (const cat of unique.sort()) {
    console.log('-', cat)
  }
}

main().catch(console.error)
