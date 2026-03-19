import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, topic, context } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 })
    }

    const systemPrompt = topic
      ? `You are a helpful AI learning assistant for a quiz app. The user just completed a quiz about "${topic}". ${context || ""} Help them understand concepts, explain wrong answers, and answer questions about the topic. Be concise, clear and educational.`
      : `You are a helpful AI learning assistant for a quiz app. Help users understand quiz topics and explain concepts clearly.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content
    if (!reply) throw new Error("No reply from Groq")

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    )
  }
}