// Übersetzung mit Groq AI (Llama 3.1)
// Diese Funktion übersetzt einen Text ins Deutsche

export async function translateToGerman(text: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const prompt = `Übersetze folgenden Text ins Deutsche, möglichst natürlich und lebensmitteltypisch:\n\n"${text}"`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3-8b-8192',
      messages: [
        { role: 'system', content: 'Du bist ein professioneller Übersetzer für Lebensmittel und Rezepte.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  })

  if (!response.ok) throw new Error('Groq API error')
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || text
}
