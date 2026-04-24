import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

const PROMPT = `Analyze this image and suggest metadata for organizing it in a brand asset library.
Return a JSON object with:
- "group": one category word (e.g. "nature", "architecture", "food", "people", "technology", "abstract", "fashion", "interior", "animals", "travel")
- "tags": array of 3-5 descriptive lowercase tags (single words or short 2-word phrases)

Respond with ONLY valid JSON — no markdown, no explanation.
Example: {"group": "nature", "tags": ["landscape", "mountains", "outdoor", "scenic"]}`

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI suggestions not configured' }, { status: 503 })
  }

  const body = await request.json()
  const { imageUrl } = body as { imageUrl?: string }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
  }

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 256,
    }),
  })

  if (!groqResponse.ok) {
    const errorBody = await groqResponse.text()
    console.error('[suggest-tags] Groq error', groqResponse.status, errorBody)
    return NextResponse.json({ error: `AI service error: ${groqResponse.status}` }, { status: 502 })
  }

  const groqData = await groqResponse.json()
  const rawText: string = groqData.choices?.[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(stripMarkdownFences(rawText))
    return NextResponse.json({
      group: typeof parsed.group === 'string'
        ? parsed.group.charAt(0).toUpperCase() + parsed.group.slice(1).toLowerCase()
        : null,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((tag: unknown) => String(tag).toLowerCase())
        : [],
    })
  } catch {
    console.error('[suggest-tags] Failed to parse Groq response:', rawText)
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }
}
