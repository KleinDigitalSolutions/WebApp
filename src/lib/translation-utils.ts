// Translation utilities for recipes
export interface RecipeTranslation {
  original: string
  translated: string
}

// Common cooking terms translation map
export const cookingTermsMap: Record<string, string> = {
  // Ingredients
  'chicken': 'Hähnchen',
  'beef': 'Rindfleisch',
  'pork': 'Schweinefleisch',
  'fish': 'Fisch',
  'salmon': 'Lachs',
  'tuna': 'Thunfisch',
  'shrimp': 'Garnelen',
  'eggs': 'Eier',
  'milk': 'Milch',
  'butter': 'Butter',
  'cheese': 'Käse',
  'cream': 'Sahne',
  'flour': 'Mehl',
  'sugar': 'Zucker',
  'salt': 'Salz',
  'pepper': 'Pfeffer',
  'onion': 'Zwiebel',
  'garlic': 'Knoblauch',
  'tomato': 'Tomate',
  'potato': 'Kartoffel',
  'carrot': 'Karotte',
  'celery': 'Sellerie',
  'mushrooms': 'Pilze',
  'spinach': 'Spinat',
  'lettuce': 'Salat',
  'cucumber': 'Gurke',
  'bell pepper': 'Paprika',
  'broccoli': 'Brokkoli',
  'cauliflower': 'Blumenkohl',
  'cabbage': 'Kohl',
  'olive oil': 'Olivenöl',
  'vegetable oil': 'Pflanzenöl',
  'vinegar': 'Essig',
  'lemon': 'Zitrone',
  'lime': 'Limette',
  'orange': 'Orange',
  'apple': 'Apfel',
  'banana': 'Banane',
  'strawberry': 'Erdbeere',
  'blueberry': 'Heidelbeere',
  'raspberry': 'Himbeere',
  
  // Cooking methods
  'bake': 'backen',
  'boil': 'kochen',
  'fry': 'braten',
  'grill': 'grillen',
  'roast': 'rösten',
  'steam': 'dämpfen',
  'simmer': 'köcheln',
  'sauté': 'anbraten',
  'stir': 'umrühren',
  'mix': 'mischen',
  'blend': 'mixen',
  'chop': 'hacken',
  'slice': 'schneiden',
  'dice': 'würfeln',
  'mince': 'fein hacken',
  'marinate': 'marinieren',
  'season': 'würzen',
  
  // Measurements
  'cup': 'Tasse',
  'cups': 'Tassen',
  'tablespoon': 'Esslöffel',
  'tablespoons': 'Esslöffel',
  'teaspoon': 'Teelöffel',
  'teaspoons': 'Teelöffel',
  'ounce': 'Unze',
  'ounces': 'Unzen',
  'pound': 'Pfund',
  'pounds': 'Pfund',
  'gram': 'Gramm',
  'grams': 'Gramm',
  'kilogram': 'Kilogramm',
  'liter': 'Liter',
  'milliliter': 'Milliliter',
  'ml': 'ml',
  'kg': 'kg',
  'g': 'g',
  
  // Common words
  'recipe': 'Rezept',
  'ingredients': 'Zutaten',
  'instructions': 'Anweisungen',
  'directions': 'Anweisungen',
  'preparation': 'Vorbereitung',
  'cooking time': 'Kochzeit',
  'prep time': 'Vorbereitungszeit',
  'servings': 'Portionen',
  'serves': 'für',
  'difficulty': 'Schwierigkeit',
  'easy': 'einfach',
  'medium': 'mittel',
  'hard': 'schwer',
  'breakfast': 'Frühstück',
  'lunch': 'Mittagessen',
  'dinner': 'Abendessen',
  'dessert': 'Dessert',
  'snack': 'Snack',
  'appetizer': 'Vorspeise',
  'main course': 'Hauptgang',
  'side dish': 'Beilage',
  'soup': 'Suppe',
  'salad': 'Salat',
  'pasta': 'Nudeln',
  'pizza': 'Pizza',
  'cake': 'Kuchen',
  'bread': 'Brot',
  'sandwich': 'Sandwich',
  'vegetarian': 'vegetarisch',
  'vegan': 'vegan',
  'gluten-free': 'glutenfrei',
  'healthy': 'gesund',
  'quick': 'schnell',
  'delicious': 'lecker'
}

// Category translations
export const categoryTranslations: Record<string, string> = {
  'Beef': 'Rindfleisch',
  'Chicken': 'Hähnchen',
  'Pork': 'Schweinefleisch',
  'Seafood': 'Meeresfrüchte',
  'Vegetarian': 'Vegetarisch',
  'Vegan': 'Vegan',
  'Dessert': 'Dessert',
  'Breakfast': 'Frühstück',
  'Side': 'Beilage',
  'Starter': 'Vorspeise',
  'Goat': 'Ziege',
  'Lamb': 'Lamm',
  'Miscellaneous': 'Sonstiges',
  'Pasta': 'Nudeln',
  'Soup': 'Suppe'
}

// Area/cuisine translations
export const areaTranslations: Record<string, string> = {
  'Italian': 'Italienisch',
  'French': 'Französisch',
  'German': 'Deutsch',
  'Spanish': 'Spanisch',
  'Greek': 'Griechisch',
  'Turkish': 'Türkisch',
  'Indian': 'Indisch',
  'Chinese': 'Chinesisch',
  'Japanese': 'Japanisch',
  'Thai': 'Thailändisch',
  'Mexican': 'Mexikanisch',
  'American': 'Amerikanisch',
  'British': 'Britisch',
  'Irish': 'Irisch',
  'Moroccan': 'Marokkanisch',
  'Egyptian': 'Ägyptisch',
  'Russian': 'Russisch',
  'Polish': 'Polnisch',
  'Croatian': 'Kroatisch',
  'Dutch': 'Niederländisch',
  'Portuguese': 'Portugiesisch',
  'Jamaican': 'Jamaikanisch',
  'Canadian': 'Kanadisch',
  'Malaysian': 'Malaysisch',
  'Vietnamese': 'Vietnamesisch',
  'Tunisian': 'Tunesisch',
  'Unknown': 'Unbekannt'
}

/**
 * Translate text using local dictionary first, then fallback to AI
 */
export function translateText(text: string): string {
  if (!text) return text
  
  let translated = text
  
  // Apply direct translations from dictionary
  Object.entries(cookingTermsMap).forEach(([english, german]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi')
    translated = translated.replace(regex, german)
  })
  
  return translated
}

/**
 * Translate recipe category
 */
export function translateCategory(category: string): string {
  return categoryTranslations[category] || category
}

/**
 * Translate cuisine area
 */
export function translateArea(area: string): string {
  return areaTranslations[area] || area
}

/**
 * Translate ingredients list
 */
export function translateIngredients(ingredients: Array<{name: string, measure: string}>): Array<{name: string, measure: string}> {
  return ingredients.map(ingredient => ({
    name: translateText(ingredient.name),
    measure: translateText(ingredient.measure)
  }))
}

/**
 * Translate recipe instructions (basic)
 */
export function translateInstructions(instructions: string): string {
  if (!instructions) return instructions
  
  // Split into sentences and translate each
  const sentences = instructions.split(/[.!?]+/)
  const translatedSentences = sentences.map(sentence => {
    if (!sentence.trim()) return sentence
    return translateText(sentence.trim())
  })
  
  return translatedSentences.join('. ')
}

/**
 * Advanced translation using Groq AI
 */
export async function translateWithAI(text: string, targetLanguage: string = 'German'): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Translate the following cooking/recipe text to ${targetLanguage}. Keep cooking terminology accurate and cultural context appropriate. Only return the translation, no explanations: "${text}"`
      })
    })
    
    if (!response.ok) {
      throw new Error('Translation failed')
    }
    
    const data = await response.json()
    return data.response || text
  } catch (error) {
    console.error('AI translation failed:', error)
    return translateText(text) // Fallback to local translation
  }
}
