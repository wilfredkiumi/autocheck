import 'server-only'

import OpenAI from 'openai'

let _openai: OpenAI | null = null
function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

/** Generate a clean booking summary for the garage owner dashboard and briefs. */
export async function generateBookingSummary(input: {
  symptom?: string
  plate?: string
  slot?: string
  phone: string
  garageName: string
}): Promise<string> {
  const { symptom, plate, slot, phone, garageName } = input

  const fallback = `New booking: ${symptom || 'Issue described'}. ${plate ? `Car: ${plate}. ` : ''}${slot ? `Slot: ${slot}.` : ''}`

  const openai = getClient()
  if (!openai) return fallback

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content:
            'You are a garage booking assistant. Write a short, clear booking summary for a mechanic in Kenya. Keep it under 3 lines. Include: what the problem is, which car, and when they are coming. Be direct and practical. No greetings or fluff.',
        },
        {
          role: 'user',
          content: `Booking for ${garageName}:\n- Problem: ${symptom || 'Not specified'}\n- Car plate: ${plate || 'Not provided'}\n- Time slot: ${slot || 'Not specified'}\n- Customer phone: ${phone}`,
        },
      ],
    })

    return res.choices[0]?.message?.content?.trim() || fallback
  } catch (e) {
    console.error('[ai-summary] OpenAI call failed:', e)
    return fallback
  }
}
