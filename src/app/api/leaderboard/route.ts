import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get("topic")
    const difficulty = searchParams.get("difficulty")

    let query = supabase
      .from("leaderboard")
      .select("*")
      .order("percentage", { ascending: false })
      .order("time_taken", { ascending: true })
      .limit(10)

    if (topic) query = query.ilike("topic", `%${topic}%`)
    if (difficulty) query = query.eq("difficulty", difficulty)

    const { data, error } = await query
    if (error) throw error

    const entries = (data || []).map((row) => ({
      id: row.id,
      username: row.username,
      topic: row.topic,
      difficulty: row.difficulty,
      score: row.score,
      total: row.total,
      earnedMarks: row.earned_marks,
      totalMarks: row.total_marks,
      percentage: row.percentage,
      timeTaken: row.time_taken,
      date: row.date,
    }))

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 })
  }
}