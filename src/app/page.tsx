"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"

const TOPIC_SUGGESTIONS = [
  "Cricket", "Science", "History", "Movies",
  "Geography", "Music", "Sports", "Technology",
  "Math", "Politics", "Animals", "Food",
]

export default function Home() {
  const router = useRouter()
  const { setConfig, setQuestions, setLoading, setError, isLoading, error } =
    useQuizStore()

  const [topic, setTopic] = useState("")
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState("10")
  const [isOnline, setIsOnline] = useState(true)
  const [lastConfig, setLastConfig] = useState<{
    topic: string
    questionCount: number
    difficulty: "Easy" | "Medium" | "Hard"
    timerEnabled: boolean
    timerMinutes: string
  } | null>(null)

  // Network check
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "") { setTimerMinutes(""); return }
    const num = parseInt(val)
    if (!isNaN(num)) {
      setTimerMinutes(Math.min(num, 180).toString())
    }
  }

  const handleSubmit = async (overrideConfig?: typeof lastConfig) => {
    if (!isOnline) {
      setError("You are offline. Please check your internet connection.")
      return
    }

    const currentTopic = overrideConfig?.topic ?? topic
    const currentCount = overrideConfig?.questionCount ?? questionCount
    const currentDifficulty = overrideConfig?.difficulty ?? difficulty
    const currentTimerEnabled = overrideConfig?.timerEnabled ?? timerEnabled
    const currentTimerMinutes = overrideConfig?.timerMinutes ?? timerMinutes

    if (!currentTopic.trim()) {
      setError("Please enter a topic")
      return
    }
    if (currentTimerEnabled && (!parseInt(currentTimerMinutes) || parseInt(currentTimerMinutes) < 1)) {
      setError("Please enter a valid timer duration")
      return
    }

    setError(null)
    setLoading(true)

    const config = {
      topic: currentTopic,
      questionCount: currentCount,
      difficulty: currentDifficulty,
      timerEnabled: currentTimerEnabled,
      timerSeconds: currentTimerEnabled ? parseInt(currentTimerMinutes) * 60 : null,
    }

    setLastConfig({
      topic: currentTopic,
      questionCount: currentCount,
      difficulty: currentDifficulty,
      timerEnabled: currentTimerEnabled,
      timerMinutes: currentTimerMinutes,
    })

    setConfig(config)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions")
      }

      setQuestions(data.questions)
      router.push("/quiz")
    } catch (err) {
      if (!navigator.onLine) {
        setError("You are offline. Please check your internet connection.")
      } else {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-4">

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz App</h1>
          <p className="text-gray-400">Generate a quiz on any topic using AI</p>
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>You are offline. Please check your internet connection.</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-5">

          {/* Topic */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Quiz Topic
            </label>
            <input
              type="text"
              placeholder="e.g. World War 2, Python, Basketball..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {TOPIC_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    topic === suggestion
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min={5}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Difficulty
            </label>
            <div className="flex gap-3">
              {(["Easy", "Medium", "Hard"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    difficulty === level
                      ? level === "Easy"
                        ? "bg-green-500 text-white"
                        : level === "Medium"
                        ? "bg-yellow-500 text-black"
                        : "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Timer
              </label>
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  timerEnabled ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    timerEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {timerEnabled && (
              <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={timerMinutes}
                  onChange={handleTimerChange}
                  className="bg-transparent text-white w-16 outline-none text-center text-lg font-semibold"
                />
                <span className="text-gray-400 text-sm">minutes for entire quiz</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              <p className="mb-2">{error}</p>
              {/* Retry button */}
              {lastConfig && (
                <button
                  onClick={() => handleSubmit(lastConfig)}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => handleSubmit()}
            disabled={isLoading || !isOnline}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isLoading ? "Generating Quiz..." : "Generate Quiz"}
          </button>
        </div>
      </div>
    </main>
  )
}