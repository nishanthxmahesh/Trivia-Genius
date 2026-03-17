import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { topic, questionCount, difficulty } = await request.json()

    if (!topic || !questionCount || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = `Generate ${questionCount} multiple choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array with no extra text, no markdown, no code blocks.
Each question must follow this exact format:
[
  {
    "id": "1",
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

Rules:
- Each question must have exactly 4 options
- correctAnswer must be exactly one of the 4 options
- Questions should match the ${difficulty} difficulty level
- Make questions clear and unambiguous`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a quiz generator. You always respond with valid JSON only. No markdown, no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content

    if (!text) {
      throw new Error("No response from Groq")
    }

    const cleanedText = text.replace(/```json|```/g, "").trim()
    const questions = JSON.parse(cleanedText)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Groq API error:", error)
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    )
  }
}