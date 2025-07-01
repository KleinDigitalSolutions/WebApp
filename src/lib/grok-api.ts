// Grok AI API Integration
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GrokResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

export class GrokAPI {
  private apiKey: string
  private baseUrl = 'https://api.x.ai/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data: GrokResponse = await response.json()
      return data.choices[0]?.message.content || 'Sorry, I could not generate a response.'
    } catch (error) {
      console.error('Grok API error:', error)
      return 'Sorry, I encountered an error while processing your request.'
    }
  }

  // Helper function to create nutrition expert system prompt
  createNutritionExpertPrompt(userProfile?: { 
    goal?: string; 
    dietary_restrictions?: string; 
    health_conditions?: string;
    [key: string]: unknown;
  }): ChatMessage {
    const basePrompt = `You are a friendly and knowledgeable nutrition expert helping users with their dietary goals. 
    
You should:
- Provide evidence-based nutrition advice
- Be encouraging and supportive
- Give practical, actionable tips
- Consider individual dietary needs and preferences
- Suggest healthy food alternatives when appropriate
- Help with meal planning and recipe suggestions
- Explain nutritional concepts in simple terms

Remember to always recommend consulting healthcare professionals for serious health concerns.`

    const profileContext = userProfile ? `

User Profile:
- Goal: ${userProfile.goal || 'Not specified'}
- Activity Level: ${userProfile.activity_level || 'Not specified'}
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}` : ''

    return {
      role: 'system',
      content: basePrompt + profileContext
    }
  }
}
