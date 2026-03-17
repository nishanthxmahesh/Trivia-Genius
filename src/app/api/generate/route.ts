import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

async function generateWithRetry(
  prompt: string,
  retries = 3
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a quiz generator. You always respond with valid JSON only. No markdown, no extra text, no code blocks.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      })

      const text = completion.choices[0]?.message?.content
      if (!text) throw new Error("Empty response from Groq")
      return text
    } catch (error: unknown) {
      const isLast = i === retries - 1
      if (isLast) throw error

      // Wait before retrying (exponential backoff)
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)))
    }
  }
  throw new Error("All retries failed")
}

export async function POST(request: Request) {
  try {
    // Check if request body is valid
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { topic, questionCount, difficulty } = body

    // Validate inputs
    if (!topic || !questionCount || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: topic, questionCount, difficulty" },
        { status: 400 }
      )
    }

    if (typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic must be a non-empty string" },
        { status: 400 }
      )
    }

    if (questionCount < 1 || questionCount > 20) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 20" },
        { status: 400 }
      )
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be Easy, Medium, or Hard" },
        { status: 400 }
      )
    }

    const prompt = `Generate ${questionCount} multiple choice quiz questions about "${topic.trim()}" at ${difficulty} difficulty level.

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

    const text = await generateWithRetry(prompt)

    // Clean and parse response
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    let questions
    try {
      questions = JSON.parse(cleanedText)
    } catch {
      // Try to extract JSON array from response
      const match = cleanedText.match(/\[[\s\S]*\]/)
      if (!match) {
        return NextResponse.json(
          { error: "AI returned an invalid response. Please try again." },
          { status: 500 }
        )
      }
      questions = JSON.parse(match[0])
    }

    // Validate questions structure
    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid questions format. Please try again." },
        { status: 500 }
      )
    }

    // Validate each question
    const validQuestions = questions.filter(
      (q) =>
        q.id &&
        q.text &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.correctAnswer &&
        q.options.includes(q.correctAnswer)
    )

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: "No valid questions generated. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ questions: validQuestions })
  } catch (error: unknown) {
    console.error("API error:", error)

    // Handle specific Groq errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return NextResponse.json(
          { error: "AI service is busy. Please wait a moment and try again." },
          { status: 429 }
        )
      }
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        return NextResponse.json(
          { error: "API key issue. Please check your configuration." },
          { status: 401 }
        )
      }
      if (
        error.message.includes("network") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch")
      ) {
        return NextResponse.json(
          { error: "Network error. Please check your connection and try again." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    )
  }
}