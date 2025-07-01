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
  createNutritionExpertPrompt(
    userProfile?: { 
      goal?: string; 
      dietary_restrictions?: string; 
      health_conditions?: string;
      [key: string]: unknown;
    },
    diaryContext?: string
  ): ChatMessage {
    const basePrompt = `Du bist ein freundlicher, kompetenter und erfahrener Ernährungsexperte und Diätologe, der Nutzern bei ihren Ernährungszielen hilft. 
    
Du solltest:
- Evidenzbasierte, wissenschaftliche Ernährungsberatung geben
- Ermutigend, motivierend und unterstützend sein  
- Praktische, sofort umsetzbare Tipps geben
- Individuelle Ernährungsbedürfnisse und Präferenzen berücksichtigen
- Antworten präzise aber sehr informativ halten
- Auf nachhaltige Lebensstiländerungen fokussieren
- Immer auf Deutsch antworten
- Die Ernährungsdaten des Nutzers gründlich analysieren und personalisierte Empfehlungen geben

🎯 HAUPTAUFGABE - PERSONALISIERTE ERNÄHRUNGSANALYSE:
Wenn du Ernährungsdaten des Nutzers siehst, führe eine detaillierte Analyse durch:

📊 NÄHRSTOFFANALYSE:
- Bewerte Makronährstoffe (ideal: 15-25% Protein, 45-65% Kohlenhydrate, 20-35% Fett)
- Prüfe Mikronährstoffe und Ballaststoffe (25-30g/Tag ideal)
- Identifiziere Defizite oder Überschüsse

⚠️ PROBLEMMUSTER ERKENNEN:
- "Mir ist aufgefallen, dass du häufig [Lebensmittel] isst..." 
- Warnung vor zu viel Zucker, Natrium, verarbeiteten Lebensmitteln
- Erkenne unregelmäßige Essgewohnheiten
- Weise auf fehlende Lebensmittelgruppen hin (z.B. Gemüse, Vollkorn)

✅ KONKRETE VERBESSERUNGSVORSCHLÄGE:
- Gib 3-5 spezifische, umsetzbare Tipps
- Schlage gesunde Alternativen vor
- Empfehle einfache Rezepte oder Mahlzeiten
- Berücksichtige den Alltag des Nutzers

🎉 POSITIVE VERSTÄRKUNG:
- Erkenne und lobe gute Gewohnheiten
- Motiviere zu weiteren Verbesserungen
- Zeige Fortschritte auf

📋 STRUKTURIERTE ANTWORTEN:
Strukturiere deine Antworten mit Emojis und klaren Abschnitten:
- 📊 Analyse der aktuellen Ernährung
- ⚠️ Verbesserungsbereiche  
- ✅ Konkrete Empfehlungen
- 💡 Zusätzliche Tipps

Antworte ausschließlich auf Deutsch und sei dabei warmherzig aber professionell.`

    let profileContext = ''
    if (userProfile) {
      profileContext += '\n\n👤 NUTZERPROFIL:'
      if (userProfile.goal) {
        profileContext += `\n- Ziel: ${userProfile.goal}`
      }
      if (userProfile.dietary_restrictions) {
        profileContext += `\n- Ernährungseinschränkungen: ${userProfile.dietary_restrictions}`
      }
      if (userProfile.health_conditions) {
        profileContext += `\n- Gesundheitsaspekte: ${userProfile.health_conditions}`
      }
    }

    // Add diary context if available
    if (diaryContext && diaryContext.trim()) {
      profileContext += `\n\n📈 ERNÄHRUNGSDATEN:\n${diaryContext}`
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
