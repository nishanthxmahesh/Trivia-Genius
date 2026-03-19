import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const { question, options, topic, difficulty, hintLevel } = await request.json()

    if (!question || !options) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hintInstructions = [
      "Give a very subtle hint — just point the user in the right direction without revealing anything specific.",
      "Give a moderate hint — narrow down the options or give a clearer clue, but don't reveal the answer.",
      "Give a strong hint — almost reveal the answer but let the user figure out the final step.",
    ]

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful quiz assistant. ${hintInstructions[(hintLevel || 1) - 1]} Keep it to 2-3 sentences max.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}
Difficulty: ${difficulty}
Question: ${question}
Options: ${options.join(", ")}
Hint Level: ${hintLevel}/3

Provide hint level ${hintLevel}.`,
        },
      ],
      temperature: 0.7,
    })

    const hint = completion.choices[0]?.message?.content
    if (!hint) throw new Error("No hint generated")
    return NextResponse.json({ hint })
  } catch (error) {
    console.error("Hint API error:", error)
    return NextResponse.json({ error: "Failed to generate hint." }, { status: 500 })
  }
}