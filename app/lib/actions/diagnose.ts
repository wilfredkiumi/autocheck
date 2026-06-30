'use server'

import OpenAI from 'openai'

let _client: OpenAI | null = null
function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

export type DiagnoseResult =
  | { ok: true; text: string }
  | { ok: false; error: string }

// Takes the driver's selected issues + free-text note and returns a structured
// technician-ready summary. Runs server-side so the API key stays off the client.
export async function diagnoseAction(input: {
  issues: string[]
  note: string
  plate?: string
}): Promise<DiagnoseResult> {
  const { issues, note, plate } = input

  if (!issues.length && !note.trim()) {
    return { ok: false, error: 'Select at least one issue or describe the problem first.' }
  }

  const client = getClient()
  if (!client) {
    // Graceful fallback when no API key is configured
    const parts = issues.length ? issues.join(', ') : 'Issue described'
    const noteClean = note.trim()
    return {
      ok: true,
      text: noteClean
        ? `${parts}. Driver notes: "${noteClean}". Inspect on arrival and quote before starting work.`
        : `${parts}. Inspect on arrival, confirm diagnosis with driver, and quote before starting work.`,
    }
  }

  try {
    const symptomBlock = issues.length
      ? `Selected issues: ${issues.join(', ')}`
      : 'No issues selected from the list'
    const noteBlock = note.trim()
      ? `Driver's own words: "${note.trim()}"`
      : 'No additional notes from the driver'
    const plateBlock = plate ? `Car: ${plate}` : ''

    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            'You are helping a driver in Kenya describe their car problem clearly before booking a garage. Take their rough notes and selected issues and rewrite them as a clear, natural description from the driver\'s point of view — first person, conversational, like they\'re explaining it to the mechanic face-to-face. Include when it happens, how often, and any sounds/smells/feelings they mentioned. Keep it 2-4 sentences. Don\'t give repair advice or tell the mechanic what to do — just help the driver express what\'s going on. No greetings.',
        },
        {
          role: 'user',
          content: [plateBlock, symptomBlock, noteBlock].filter(Boolean).join('\n'),
        },
      ],
    })

    const text = res.choices[0]?.message?.content?.trim() ?? ''
    if (!text) {
      return { ok: false, error: 'AI returned an empty response. Try again.' }
    }
    return { ok: true, text }
  } catch (e) {
    console.error('[diagnose] OpenAI call failed:', e)
    return { ok: false, error: 'AI diagnosis is temporarily unavailable. Try again shortly.' }
  }
}
