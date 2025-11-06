import Groq from 'groq-sdk'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export class GeminiAPI {
  private apiKey: string
  private client: Groq
  private modelName: string

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || ''
    this.modelName = process.env.GROQ_MODEL || 'llama3.1-70b-versatile'
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY not found in environment variables')
    }
    this.client = new Groq({ apiKey: this.apiKey })
  }

  async chat(history: ChatMessage[], userMessage: string): Promise<string> {
    if (!this.apiKey) throw new Error('Groq API key not configured')

    const messages = [
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ]

    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: 0.6,
      max_tokens: 1024,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Groq response was empty')
    }

    return content
  }
}
