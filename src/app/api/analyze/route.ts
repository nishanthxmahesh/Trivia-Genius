import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { topic, wrongQuestions } = await req.json()

    if (!wrongQuestions || wrongQuestions.length === 0) {
      return NextResponse.json({ summary: "You're a master! No weak areas detected." })
    }

    const wrongListDetails = wrongQuestions.map((q: any) => `- Question: ${q.question}\n  User Answer: ${q.userAnswer}\n  Correct Answer: ${q.correctAnswer}\n`).join("\n")

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
            content: `You are an expert tutor. Analyze the user's wrong quiz answers for the topic "${topic}". Generate a short, formatted markdown summary identifying EXACTLY which specific subtopics and core concepts they are weak in, and give 2 brief actionable tips on how to study them. Do not hallucinate. Be extremely concise. Use bolding and lists.`
          },
          {
            role: "user",
            content: `Wrong Questions:\n${wrongListDetails}`
          }
        ],
        temperature: 0.3,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || "Generation failed")
    
    return NextResponse.json({ summary: data.choices[0].message.content })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
