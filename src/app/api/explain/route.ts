import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const { question, correctAnswer, userAnswer, topic } = await request.json()
    if (!question || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful quiz explanation assistant. Explain why the correct answer is right in 2-3 sentences. Be educational and clear.",
        },
        {
          role: "user",
          content: `Topic: ${topic}
Question: ${question}
Correct Answer: ${correctAnswer}
User's Answer: ${userAnswer || "Not answered"}
Explain why "${correctAnswer}" is the correct answer.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const explanation = completion.choices[0]?.message?.content
    if (!explanation) throw new Error("No explanation generated")
    return NextResponse.json({ explanation })
  } catch (error) {
    console.error("Explain API error:", error)
    return NextResponse.json({ error: "Failed to generate explanation." }, { status: 500 })
  }
}