import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { questions, config } = await request.json()
    if (!questions || !config) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const shareId = `share_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const { error } = await supabase.from("shared_quizzes").insert({
      id: shareId,
      topic: config.topic,
      difficulty: config.difficulty,
      questions,
      config,
    })

    if (error) throw error

    return NextResponse.json({ shareId })
  } catch (error) {
    console.error("Share error:", error)
    return NextResponse.json({ error: "Failed to create share link." }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { data, error } = await supabase
      .from("shared_quizzes")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json({ quiz: data })
  } catch (error) {
    console.error("Share fetch error:", error)
    return NextResponse.json({ error: "Failed to load quiz." }, { status: 500 })
  }
}