"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"

export default function HistoryPage() {
  const router = useRouter()
  const { history, resetQuiz, setConfig, setQuestions, loadHistory, isSyncing } = useQuizStore()

  const [sortBy, setSortBy] = useState<"date" | "score">("date")
  const [filterDifficulty, setFilterDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All")

  useEffect(() => { loadHistory() }, [])

  const filtered = history
    .filter((a) => filterDifficulty === "All" ? true : a.difficulty === filterDifficulty)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime()
      return b.score / b.total - a.score / a.total
    })

  const handleRetake = (attemptId: string) => {
    const attempt = history.find((a) => a.id === attemptId)
    if (!attempt) return
    resetQuiz()
    setConfig({
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      questionCount: attempt.total,
      timerEnabled: attempt.timerEnabled,
      timerSeconds: attempt.timerSeconds,
      totalMarks: attempt.totalMarks || 100,
      hintsEnabled: attempt.hintsEnabled || false,
      aiChatEnabled: attempt.aiChatEnabled || false,
      username: attempt.username || "Anonymous",
      questionTypes: attempt.questionTypes || ["mcq"],
    })
    setQuestions(attempt.questions)
    router.push("/quiz")
  }

  const getScoreColor = (score: number, total: number) => {
    const pct = (score / total) * 100
    if (pct >= 80) return "text-green-400"
    if (pct >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="w-full max-w-xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >← Back</button>
          <h1 className="text-2xl font-bold">Quiz History</h1>
          {isSyncing && (
            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">Syncing...</span>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-16">Sort by</span>
            <div className="flex gap-2">
              {(["date", "score"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-16">Difficulty</span>
            <div className="flex gap-2">
              {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDifficulty(d)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterDifficulty === d
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isSyncing && history.length === 0 && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="h-4 w-32 bg-gray-800 rounded mb-2" />
                    <div className="h-3 w-20 bg-gray-800 rounded" />
                  </div>
                  <div className="h-8 w-12 bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isSyncing && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No quizzes yet</p>
            <p className="text-gray-600 text-sm mb-6">Complete a quiz to see your history here</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Generate a Quiz
            </button>
          </div>
        )}

        {/* History list */}
        <div className="flex flex-col gap-3">
          {filtered.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.total) * 100)
            const date = new Date(attempt.date).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })
            const minutes = Math.floor(attempt.timeTaken / 60)
            const seconds = attempt.timeTaken % 60

            return (
              <div key={attempt.id} className="bg-gray-900 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold capitalize">{attempt.topic}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {attempt.username && (
                        <span className="text-blue-400 mr-1">{attempt.username} •</span>
                      )}
                      {date}
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(attempt.score, attempt.total)}`}>
                    {percentage}%
                  </span>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">{attempt.difficulty}</span>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">
                    {attempt.score}/{attempt.total} correct
                  </span>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">
                    {minutes}m {seconds}s
                  </span>
                  {attempt.earnedMarks !== undefined && (
                    <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-lg">
                      {attempt.earnedMarks}/{attempt.totalMarks} marks
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRetake(attempt.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                  >Retake</button>
                  <button
                    onClick={() => router.push(`/results/${attempt.id}`)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-xl transition-colors"
                  >View Results</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}