import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export class GeminiAPI {
  private apiKey: string
  private modelName: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    this.modelName = 'gemini-1.5-flash' // oder 'gemini-2.5-flash' wenn verfügbar
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables')
    }
  }

  async chat(history: ChatMessage[], userMessage: string): Promise<string> {
    if (!this.apiKey) throw new Error('Gemini API key not configured')
    const genAI = new GoogleGenerativeAI(this.apiKey)
    const model = genAI.getGenerativeModel({ model: this.modelName })
    // History für Chat aufbereiten
    const chatHistory = history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }))
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    })
    const result = await chat.sendMessage(userMessage)
    return await result.response.text()
  }
}
