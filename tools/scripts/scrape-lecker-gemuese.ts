// tools/scripts/scrape-lecker-gemuese.ts
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://www.lecker.de/gemuese?page='
const MAX_PAGES = 10

async function scrape() {
  const titles = new Set<string>()
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${BASE_URL}${page}`
    console.log('Lade:', url)
    const res = await fetch(url)
    const html = await res.text()
    const $ = cheerio.load(html)
    // Rezepte-Titel extrahieren (angepasst an lecker.de)
    $(".o-teaser__heading a").each((_, el) => {
      const title = $(el).text().trim()
      if (title) titles.add(title)
    })
  }
  console.log(`\n${titles.size} eindeutige Rezepte gefunden:`)
  for (const t of titles) console.log('-', t)
}

scrape().catch(console.error)
