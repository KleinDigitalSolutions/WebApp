// Groq AI API Integration
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

export class GroqAPI {
  private apiKey: string
  private baseUrl = 'https://api.groq.com/openai/v1'

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || ''
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY not found in environment variables')
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Updated to available model
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Groq API error: ${response.status} - ${errorText}`)
      }

      const data: GroqResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Groq API')
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }

  // Helper function to create nutrition expert system prompt
  createNutritionExpertPrompt(userProfile?: { 
    goal?: string; 
    dietary_restrictions?: string; 
    health_conditions?: string;
    [key: string]: unknown;
  }): ChatMessage {
    const basePrompt = `Du bist ein freundlicher und kompetenter Ernährungsexperte, der Nutzern bei ihren Ernährungszielen hilft. 
    
Du solltest:
- Evidenzbasierte Ernährungsberatung geben
- Ermutigend und unterstützend sein
- Praktische, umsetzbare Tipps geben
- Individuelle Ernährungsbedürfnisse und Präferenzen berücksichtigen
- Antworten präzise aber informativ halten
- Auf nachhaltige Lebensstiländerungen fokussieren
- Immer auf Deutsch antworten

Antworte ausschließlich auf Deutsch.`

    let profileContext = ''
    if (userProfile) {
      if (userProfile.goal) {
        profileContext += `\nNutzerziel: ${userProfile.goal}`
      }
      if (userProfile.dietary_restrictions) {
        profileContext += `\nErnährungseinschränkungen: ${userProfile.dietary_restrictions}`
      }
      if (userProfile.health_conditions) {
        profileContext += `\nGesundheitsaspekte: ${userProfile.health_conditions}`
      }
    }

    return {
      role: 'system',
      content: basePrompt + profileContext
    }
  }

  // Helper function to analyze nutrition data and provide insights
  async getNutritionInsights(nutritionData: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }, userGoal?: string): Promise<string> {
    const systemPrompt = this.createNutritionExpertPrompt({ goal: userGoal })
    
    const messages: ChatMessage[] = [
      systemPrompt,
      {
        role: 'user',
        content: `Please analyze this nutrition data and provide insights:
        Calories: ${nutritionData.calories}
        Protein: ${nutritionData.protein}g
        Carbs: ${nutritionData.carbs}g
        Fat: ${nutritionData.fat}g
        
        What recommendations do you have for improving this nutrition profile?`
      }
    ]

    return this.chat(messages)
  }
}
