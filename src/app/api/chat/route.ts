import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages, topic } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 })
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert, supportive AI Tutor helping a student deep dive into questions and general knowledge loosely around the topic "${topic}". Answer any questions they have, explain concepts clearly, and guide them. Keep it brief and well-formatted.`
          },
          ...messages
        ],
        temperature: 0.6,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error?.message || "Failed to contact Groq API")
    }

    return NextResponse.json({ message: data.choices[0].message.content })
  } catch (err: any) {
    console.error("Chat API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}