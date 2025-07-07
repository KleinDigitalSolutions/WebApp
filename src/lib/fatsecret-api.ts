import qs from 'querystring'

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID!
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET!
const FATSECRET_BASE_URL = process.env.FATSECRET_BASE_URL || 'https://platform.fatsecret.com/rest/server.api'

let fatSecretToken: string | null = null
let fatSecretTokenExpires = 0

async function getAccessToken() {
  if (fatSecretToken && Date.now() < fatSecretTokenExpires) return fatSecretToken
  const res = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: qs.stringify({
      grant_type: 'client_credentials',
      scope: 'basic',
      client_id: FATSECRET_CLIENT_ID,
      client_secret: FATSECRET_CLIENT_SECRET,
    }),
  })
  if (!res.ok) throw new Error('FatSecret Token Error')
  const data = await res.json()
  fatSecretToken = data.access_token
  fatSecretTokenExpires = Date.now() + (data.expires_in - 60) * 1000
  return fatSecretToken
}

export async function searchFatSecretFoods(query: string) {
  const token = await getAccessToken()
  const params = qs.stringify({
    method: 'foods.search',
    search_expression: query,
    format: 'json',
  })
  const res = await fetch(`${FATSECRET_BASE_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('FatSecret search error')
  const data = await res.json()
  // Normalisiere Ergebnis
  const foods = data.foods?.food || []
  return Array.isArray(foods) ? foods : [foods]
}
