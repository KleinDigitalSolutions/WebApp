import { NextRequest, NextResponse } from 'next/server'
import { GroqAPI, ChatMessage } from '@/lib/groq-api'

export async function POST(request: NextRequest) {
  try {
    const { messages, userProfile } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    const groqAPI = new GroqAPI()
    
    // Add system prompt as the first message
    const systemPrompt = groqAPI.createNutritionExpertPrompt(userProfile)
    const allMessages: ChatMessage[] = [systemPrompt, ...messages]

    const response = await groqAPI.chat(allMessages)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
