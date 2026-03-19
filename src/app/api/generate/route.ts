import Groq from "groq-sdk"
import { NextResponse } from "next/server"
import { QuestionType } from "@/types/quiz"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function generateWithRetry(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a quiz generator. You always respond with valid JSON only. No markdown, no extra text, no code blocks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      })
      const text = completion.choices[0]?.message?.content
      if (!text) throw new Error("Empty response")
      return text
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((res) => setTimeout(res, 1000 * (i + 1)))
    }
  }
  throw new Error("All retries failed")
}

export async function POST(request: Request) {
  try {
    let body
    try { body = await request.json() }
    catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }) }

    const { topic, questionCount, difficulty, questionTypes } = body

    if (!topic || !questionCount || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const types: QuestionType[] = questionTypes || ["mcq"]

    const typeInstructions = types.map((t) => {
      if (t === "mcq") return `Multiple choice questions with exactly 4 options`
      if (t === "truefalse") return `True/False questions with options ["True", "False"]`
      if (t === "fillintheblank") return `Fill in the blank questions — the question has a blank (___) and the correct answer fills it. Options should be 4 possible words/phrases.`
      return ""
    }).join(", ")

    const typeFormat = types.map((t) => {
      if (t === "mcq") return `{"id": "1", "type": "mcq", "text": "Question?", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}`
      if (t === "truefalse") return `{"id": "2", "type": "truefalse", "text": "Statement is true?", "options": ["True", "False"], "correctAnswer": "True"}`
      if (t === "fillintheblank") return `{"id": "3", "type": "fillintheblank", "text": "The capital of France is ___.", "options": ["Paris", "London", "Berlin", "Rome"], "correctAnswer": "Paris"}`
      return ""
    }).join(",\n")

    const rules = [
      "- correctAnswer must be exactly one of the options",
      types.includes("fillintheblank") ? "- For fill in the blank, use ___ in the question text. Even if it's a fill in the blank, provide 4 options so the correct answer is among them." : "",
      types.includes("truefalse") ? "- For true/false, options must be exactly [\"True\", \"False\"]" : "",
      types.includes("mcq") ? "- For MCQ, exactly 4 options" : "",
      `- Questions should match ${difficulty} difficulty`,
      "- Make questions clear and unambiguous",
      types.length > 1 ? "- Distribute question types evenly" : `- ALL questions MUST be of type "${types[0]}"`
    ].filter(Boolean).join("\n")

    const prompt = `Generate ${questionCount} quiz questions about "${topic}" at ${difficulty} difficulty level.
${types.length > 1 ? `Mix question types as evenly as possible from: ${typeInstructions}.` : `All questions MUST be of this exact type: ${typeInstructions}. Do NOT generate any other question types.`}

Return ONLY a valid JSON array. Each question must follow these exact formats corresponding to your generated type:
[
${typeFormat}
]

Rules:
${rules}`

    const text = await generateWithRetry(prompt)
    const cleanedText = text.replace(/```json|```/g, "").trim()

    let questions
    try {
      questions = JSON.parse(cleanedText)
    } catch {
      const match = cleanedText.match(/\[[\s\S]*\]/)
      if (!match) return NextResponse.json({ error: "AI returned invalid response." }, { status: 500 })
      questions = JSON.parse(match[0])
    }

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid questions format." }, { status: 500 })
    }

    const validQuestions = questions.filter(
      (q) => q.id && q.text && q.type && Array.isArray(q.options) &&
        q.options.length >= 2 && q.correctAnswer && q.options.includes(q.correctAnswer) &&
        types.includes(q.type)
    )

    if (validQuestions.length === 0) {
      return NextResponse.json({ error: "No valid questions generated." }, { status: 500 })
    }

    return NextResponse.json({ questions: validQuestions })
  } catch (error: unknown) {
    console.error("API error:", error)
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return NextResponse.json({ error: "AI service is busy. Please wait and try again." }, { status: 429 })
      }
    }
    return NextResponse.json({ error: "Failed to generate questions. Please try again." }, { status: 500 })
  }
}