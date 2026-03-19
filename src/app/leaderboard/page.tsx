"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LeaderboardEntry } from "@/types/quiz"

export default function LeaderboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState("")
  const [searchTopic, setSearchTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy")

  const loadLeaderboard = async (t: string, d: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (t) params.append("topic", t)
      if (d) params.append("difficulty", d)
      const response = await fetch(`/api/leaderboard?${params}`)
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (err) {
      console.error("Failed to load leaderboard:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard(searchTopic, difficulty)
  }, [searchTopic, difficulty])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}m ${s}s`
  }

  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-400"
    if (index === 1) return "text-gray-300"
    if (index === 2) return "text-amber-600"
    return "text-gray-500"
  }

  const getRankEmoji = (index: number) => {
    if (index === 0) return "🥇"
    if (index === 1) return "🥈"
    if (index === 2) return "🥉"
    return `#${index + 1}`
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >← Back</button>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Topic</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearchTopic(topic)}
                className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => setSearchTopic(topic)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Difficulty</label>
            <div className="flex gap-2">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    difficulty === d
                      ? d === "Easy" ? "bg-green-500 text-white"
                        : d === "Medium" ? "bg-yellow-500 text-black"
                        : "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchTopic && (
          <p className="text-sm text-gray-400 mb-3">
            Showing top 10 for <span className="text-white font-medium capitalize">"{searchTopic}"</span> — {difficulty}
          </p>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-48 bg-gray-800 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No entries yet</p>
            <p className="text-gray-600 text-sm mb-6">
              {searchTopic
                ? `No quizzes found for "${searchTopic}" on ${difficulty}`
                : "Search for a topic to see the leaderboard"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Take a Quiz
            </button>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="flex flex-col gap-3">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`bg-gray-900 rounded-2xl p-4 ${index === 0 ? "border border-yellow-500/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold w-8 text-center ${getRankColor(index)}`}>
                    {getRankEmoji(index)}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{entry.username}</p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{entry.topic}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          entry.percentage >= 80 ? "text-green-400"
                            : entry.percentage >= 50 ? "text-yellow-400"
                            : "text-red-400"
                        }`}>
                          {entry.percentage}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.earnedMarks}/{entry.totalMarks} marks
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-lg">
                        {entry.score}/{entry.total} correct
                      </span>
                      <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-lg">
                        ⏱ {formatTime(entry.timeTaken)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}