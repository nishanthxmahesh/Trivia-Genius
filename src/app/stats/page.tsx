"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"

export default function StatsPage() {
  const router = useRouter()
  const { history, loadHistory, isSyncing } = useQuizStore()

  useEffect(() => { loadHistory() }, [])

  const totalQuizzes = history.length
  const totalQuestions = history.reduce((acc, a) => acc + a.total, 0)
  const totalCorrect = history.reduce((acc, a) => acc + a.score, 0)
  const avgScore = totalQuizzes === 0 ? 0 : Math.round(
    history.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / totalQuizzes
  )
  const bestScore = totalQuizzes === 0 ? 0 : Math.max(...history.map((a) => Math.round((a.score / a.total) * 100)))
  const totalTimeSecs = history.reduce((acc, a) => acc + a.timeTaken, 0)
  const totalMins = Math.floor(totalTimeSecs / 60)

  const topicMap: Record<string, { score: number; total: number; count: number }> = {}
  history.forEach((a) => {
    const t = a.topic.toLowerCase()
    if (!topicMap[t]) topicMap[t] = { score: 0, total: 0, count: 0 }
    topicMap[t].score += a.score
    topicMap[t].total += a.total
    topicMap[t].count += 1
  })

  const topicStats = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    percentage: Math.round((data.score / data.total) * 100),
    count: data.count,
  }))

  const bestTopic = [...topicStats].sort((a, b) => b.percentage - a.percentage)[0]
  const mostPlayed = [...topicStats].sort((a, b) => b.count - a.count)[0]

  const difficultyMap: Record<string, { score: number; total: number; count: number }> = {
    Easy: { score: 0, total: 0, count: 0 },
    Medium: { score: 0, total: 0, count: 0 },
    Hard: { score: 0, total: 0, count: 0 },
  }
  history.forEach((a) => {
    if (difficultyMap[a.difficulty]) {
      difficultyMap[a.difficulty].score += a.score
      difficultyMap[a.difficulty].total += a.total
      difficultyMap[a.difficulty].count += 1
    }
  })

  const recentFive = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .reverse()

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-500"
    if (pct >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getBarColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500"
    if (pct >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getDifficultyColor = (d: string) => {
    if (d === "Easy") return "text-green-500"
    if (d === "Medium") return "text-yellow-500"
    return "text-red-500"
  }

  if (isSyncing && history.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">← Back</button>
            <h1 className="text-2xl font-bold">Stats</h1>
            <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-400/10 px-2 py-1 rounded-lg">Syncing...</span>
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse border border-gray-200 dark:border-transparent">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (totalQuizzes === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">← Back</button>
            <h1 className="text-2xl font-bold">Stats</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No stats yet</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm mb-6">Complete a quiz to see your stats here</p>
            <button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Generate a Quiz
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4">
      <div className="max-w-xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">← Back</button>
          <h1 className="text-2xl font-bold">Stats</h1>
          {isSyncing && <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-400/10 px-2 py-1 rounded-lg">Syncing...</span>}
        </div>

        {/* Overall Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Overall Performance</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: totalQuizzes, label: "Quizzes Taken", color: "text-blue-500" },
              { value: `${avgScore}%`, label: "Average Score", color: getScoreColor(avgScore) },
              { value: `${bestScore}%`, label: "Best Score", color: "text-green-500" },
              { value: `${totalMins}m`, label: "Total Time", color: "text-purple-500" },
              { value: totalQuestions, label: "Questions Attempted", color: "text-gray-700 dark:text-white" },
              { value: totalCorrect, label: "Correct Answers", color: "text-yellow-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Highlights</h2>
          <div className="flex flex-col gap-3">
            {bestTopic && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Best Topic</p>
                  <p className="font-semibold capitalize">{bestTopic.topic}</p>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(bestTopic.percentage)}`}>{bestTopic.percentage}%</p>
              </div>
            )}
            {mostPlayed && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Most Played Topic</p>
                  <p className="font-semibold capitalize">{mostPlayed.topic}</p>
                </div>
                <p className="text-2xl font-bold text-blue-500">{mostPlayed.count}x</p>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Difficulty Breakdown</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(difficultyMap).map(([diff, data]) => {
              if (data.count === 0) return null
              const pct = Math.round((data.score / data.total) * 100)
              return (
                <div key={diff}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getDifficultyColor(diff)}`}>{diff}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{data.count} quiz{data.count > 1 ? "zes" : ""}</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(pct)}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${getBarColor(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Trend */}
        {recentFive.length > 1 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              Recent Trend (last {recentFive.length} quizzes)
            </h2>
            <div className="flex items-end gap-2 h-24">
              {recentFive.map((a, i) => {
                const pct = Math.round((a.score / a.total) * 100)
                return (
                  <div key={a.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-xs font-medium ${getScoreColor(pct)}`}>{pct}%</span>
                    <div className="w-full flex items-end" style={{ height: "60px" }}>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${getBarColor(pct)}`}
                        style={{ height: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-600">#{i + 1}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Topic Performance */}
        {topicStats.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Topic Performance</h2>
            <div className="flex flex-col gap-3">
              {topicStats.map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm capitalize">{t.topic}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{t.count}x</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(t.percentage)}`}>{t.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${getBarColor(t.percentage)}`} style={{ width: `${t.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/history")}
          className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors border border-gray-200 dark:border-transparent"
        >
          View Full History
        </button>
      </div>
    </main>
  )
}