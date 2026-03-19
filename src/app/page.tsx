"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { QuestionType } from "@/types/quiz"

const TOPIC_SUGGESTIONS = [
  "Cricket", "Science", "History", "Movies",
  "Geography", "Music", "Sports", "Technology",
  "Math", "Politics", "Animals", "Food",
]

const HINT_RULES = [
  { level: "Hint 1", penalty: "25%", color: "text-green-400", desc: "Subtle clue, lose 25% of question marks" },
  { level: "Hint 2", penalty: "50%", color: "text-yellow-400", desc: "Moderate clue, lose 50% of question marks" },
  { level: "Hint 3", penalty: "75%", color: "text-red-400", desc: "Strong clue, lose 75% of question marks" },
]

const QUESTION_TYPES: { value: QuestionType; label: string; desc: string }[] = [
  { value: "mcq", label: "Multiple Choice", desc: "4 options to choose from" },
  { value: "truefalse", label: "True / False", desc: "Is it true or false?" },
  { value: "fillintheblank", label: "Fill in the Blank", desc: "Complete the sentence" },
]

export default function Home() {
  const router = useRouter()
  const { setConfig, setQuestions, setLoading, setError, isLoading, error } = useQuizStore()

  const [username, setUsername] = useState("")
  const [topic, setTopic] = useState("")
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerHours, setTimerHours] = useState("0")
  const [timerMinutes, setTimerMinutes] = useState("10")
  const [timerSeconds, setTimerSeconds] = useState("0")
  const [totalMarks, setTotalMarks] = useState("100")
  const [hintsEnabled, setHintsEnabled] = useState(false)
  const [aiChatEnabled, setAiChatEnabled] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["mcq"])
  const [isOnline, setIsOnline] = useState(true)
  const [lastConfig, setLastConfig] = useState<null | {
    username: string
    topic: string
    questionCount: number
    difficulty: "Easy" | "Medium" | "Hard"
    timerEnabled: boolean
    timerHours: string
    timerMinutes: string
    timerSeconds: string
    totalMarks: string
    hintsEnabled: boolean
    aiChatEnabled: boolean
    selectedTypes: QuestionType[]
  }>(null)

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

  const clamp = (val: string, max: number) => {
    if (val === "") return ""
    const num = parseInt(val)
    if (isNaN(num)) return "0"
    return Math.min(Math.max(0, num), max).toString()
  }

  const getTotalSeconds = (h: string, m: string, s: string) =>
    (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0)

  const toggleType = (type: QuestionType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev
        return prev.filter((t) => t !== type)
      }
      return [...prev, type]
    })
  }

  const handleSubmit = async (overrideConfig?: typeof lastConfig) => {
    if (!isOnline) { setError("You are offline."); return }

    const uname = overrideConfig?.username ?? username
    const t = overrideConfig?.topic ?? topic
    const qc = overrideConfig?.questionCount ?? questionCount
    const diff = overrideConfig?.difficulty ?? difficulty
    const te = overrideConfig?.timerEnabled ?? timerEnabled
    const th = overrideConfig?.timerHours ?? timerHours
    const tm = overrideConfig?.timerMinutes ?? timerMinutes
    const ts = overrideConfig?.timerSeconds ?? timerSeconds
    const marks = parseInt(overrideConfig?.totalMarks ?? totalMarks)
    const he = overrideConfig?.hintsEnabled ?? hintsEnabled
    const ace = overrideConfig?.aiChatEnabled ?? aiChatEnabled
    const types = overrideConfig?.selectedTypes ?? selectedTypes

    if (!uname.trim()) { setError("Please enter your name"); return }
    if (!t.trim()) { setError("Please enter a topic"); return }
    if (!marks || marks < 1 || marks > 100) { setError("Please enter total marks between 1 and 100"); return }
    const totalSecs = getTotalSeconds(th, tm, ts)
    if (te && totalSecs < 10) { setError("Please set a timer of at least 10 seconds"); return }

    setError(null)
    setLoading(true)

    const config = {
      username: uname.trim(),
      topic: t,
      questionCount: qc,
      difficulty: diff,
      timerEnabled: te,
      timerSeconds: te ? totalSecs : null,
      totalMarks: marks,
      hintsEnabled: he,
      aiChatEnabled: ace,
      questionTypes: types,
    }

    setLastConfig({
      username: uname, topic: t, questionCount: qc, difficulty: diff,
      timerEnabled: te, timerHours: th, timerMinutes: tm, timerSeconds: ts,
      totalMarks: marks.toString(), hintsEnabled: he, aiChatEnabled: ace,
      selectedTypes: types,
    })

    setConfig(config)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to generate questions")
      setQuestions(data.questions)
      router.push("/quiz")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const Toggle = ({
    enabled,
    onToggle,
    color = "bg-blue-600",
  }: {
    enabled: boolean
    onToggle: () => void
    color?: string
  }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? color : "bg-gray-700"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-4">

        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold mb-2">Quiz App</h1>
          <p className="text-gray-400">Generate a quiz on any topic using AI</p>
        </div>

        {!isOnline && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
            ⚠️ You are offline. Please check your internet connection.
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-5">

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Topic */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Quiz Topic</label>
            <input
              type="text"
              placeholder="e.g. World War 2, Python, Basketball..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {TOPIC_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTopic(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    topic === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Question Types</label>
            <div className="flex flex-col gap-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                    selectedTypes.includes(type.value)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                  <span className={`text-xs ${selectedTypes.includes(type.value) ? "text-blue-200" : "text-gray-500"}`}>
                    {type.desc}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Select one or more. Questions will be mixed evenly.
            </p>
          </div>

          {/* Number of Questions */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range" min={5} max={20} value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span><span>20</span>
            </div>
          </div>

          {/* Total Marks */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Total Marks</label>
            <input
              type="number" min={1} max={100} value={totalMarks}
              onChange={(e) => setTotalMarks(clamp(e.target.value, 100))}
              className="bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Each question = {totalMarks ? (parseInt(totalMarks) / questionCount).toFixed(1) : 0} marks
            </p>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Difficulty</label>
            <div className="flex gap-3">
              {(["Easy", "Medium", "Hard"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    difficulty === level
                      ? level === "Easy" ? "bg-green-500 text-white"
                        : level === "Medium" ? "bg-yellow-500 text-black"
                        : "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Timer</label>
              <Toggle enabled={timerEnabled} onToggle={() => setTimerEnabled(!timerEnabled)} />
            </div>
            {timerEnabled && (
              <div className="flex gap-3">
                {[
                  { label: "Hours", value: timerHours, max: 23, setter: setTimerHours },
                  { label: "Minutes", value: timerMinutes, max: 59, setter: setTimerMinutes },
                  { label: "Seconds", value: timerSeconds, max: 59, setter: setTimerSeconds },
                ].map(({ label, value, max, setter }) => (
                  <div key={label} className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-gray-500 text-center">{label}</label>
                    <input
                      type="number" min={0} max={max} value={value}
                      onChange={(e) => setter(clamp(e.target.value, max))}
                      className="bg-gray-800 text-white text-center text-xl font-bold rounded-xl px-2 py-3 outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enable Hints */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Enable Hints</label>
              <Toggle enabled={hintsEnabled} onToggle={() => setHintsEnabled(!hintsEnabled)} color="bg-yellow-500" />
            </div>
            {hintsEnabled && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-400 mb-3">💡 How Hints Work</p>
                <div className="flex flex-col gap-2 mb-3">
                  {HINT_RULES.map((h) => (
                    <div key={h.level} className="flex items-start gap-2">
                      <span className={`text-xs font-semibold ${h.color} shrink-0 w-14`}>{h.level}</span>
                      <span className="text-xs text-gray-400">{h.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-yellow-500/20 pt-2 flex flex-col gap-1">
                  <p className="text-xs text-gray-500">• Must unlock hints in order (1 → 2 → 3)</p>
                  <p className="text-xs text-gray-500">• Penalty applies only if you answer correctly</p>
                  <p className="text-xs text-gray-500">• Wrong answers score 0 regardless of hints</p>
                </div>
              </div>
            )}
          </div>

          {/* Enable AI Chat */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Enable AI Chat</label>
              <p className="text-xs text-gray-500 mt-0.5">Ask AI questions during review</p>
            </div>
            <Toggle enabled={aiChatEnabled} onToggle={() => setAiChatEnabled(!aiChatEnabled)} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              <p className="mb-2">{error}</p>
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