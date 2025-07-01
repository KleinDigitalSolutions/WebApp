// Simple test script to check OpenFoodFacts API
const testUrl = 'https://world.openfoodfacts.org/api/v2/search?search_terms=pizza&page_size=5&fields=code,product_name'

console.log('Testing OpenFoodFacts API directly...')
console.log('URL:', testUrl)

fetch(testUrl)
  .then(response => {
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    return response.json()
  })
  .then(data => {
    console.log('Response data:', JSON.stringify(data, null, 2))
    console.log('Number of products:', data.products?.length || 0)
  })
  .catch(error => {
    console.error('Error:', error)
  })
