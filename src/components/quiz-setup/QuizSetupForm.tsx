"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useQuizStore } from "@/store/quizStore"
import { QuestionType } from "@/types/quiz"

import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { TopicSelector } from "./TopicSelector"
import { QuestionTypeSelector } from "./QuestionTypeSelector"
import { DifficultySelector } from "./DifficultySelector"
import { AdvancedSettings } from "./AdvancedSettings"
import { AlertCircle, WifiOff } from "lucide-react"

export function QuizSetupForm() {
  const router = useRouter()
  const { setConfig, setQuestions, setLoading, setError, isLoading, error, addCustomTopic } = useQuizStore()

  const [username, setUsername] = useState("")
  const [topic, setTopic] = useState("")
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [totalMarks, setTotalMarks] = useState("100")
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["mcq"])
  
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerHours, setTimerHours] = useState("0")
  const [timerMinutes, setTimerMinutes] = useState("10")
  const [timerSeconds, setTimerSeconds] = useState("0")
  const [hintsEnabled, setHintsEnabled] = useState(false)
  const [aiChatEnabled, setAiChatEnabled] = useState(false)
  
  const [requireAllAnswers, setRequireAllAnswers] = useState(false)
  const [minTimeLimitEnabled, setMinTimeLimitEnabled] = useState(false)
  const [minTimeHours, setMinTimeHours] = useState("0")
  const [minTimeMinutes, setMinTimeMinutes] = useState("5")
  const [minTimeSeconds, setMinTimeSeconds] = useState("0")
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(false)
  const [negativeMarks, setNegativeMarks] = useState("0")
  
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.addEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const getTotalSeconds = () => (parseInt(timerHours) || 0) * 3600 + (parseInt(timerMinutes) || 0) * 60 + (parseInt(timerSeconds) || 0)

  const toggleType = (type: QuestionType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev
        return prev.filter((t) => t !== type)
      }
      return [...prev, type]
    })
  }

  const handleSubmit = async () => {
    if (!isOnline) { setError("You are offline."); return }
    if (!username.trim()) { setError("Please enter your name."); return }
    if (!topic.trim()) { setError("Please enter a topic."); return }
    
    const marks = parseInt(totalMarks)
    if (!marks || marks < 1 || marks > 100) { setError("Please enter total marks between 1 and 100."); return }
    
    const totalSecs = (parseInt(timerHours) || 0) * 3600 + (parseInt(timerMinutes) || 0) * 60 + (parseInt(timerSeconds) || 0)
    if (timerEnabled && totalSecs < 10) { setError("Timer must be at least 10 seconds."); return }

    const minTotalSecs = (parseInt(minTimeHours) || 0) * 3600 + (parseInt(minTimeMinutes) || 0) * 60 + (parseInt(minTimeSeconds) || 0)

    if (timerEnabled && minTimeLimitEnabled && minTotalSecs >= totalSecs) {
      setError(`Minimum time (${Math.floor(minTotalSecs/60)}m) MUST be strictly less than the total timer (${Math.floor(totalSecs/60)}m).`)
      return
    }

    setError(null)
    setLoading(true)
    addCustomTopic(topic)

    const config = {
      username: username.trim(),
      topic,
      questionCount,
      difficulty,
      timerEnabled,
      timerSeconds: timerEnabled ? totalSecs : null,
      totalMarks: marks,
      hintsEnabled,
      aiChatEnabled,
      questionTypes: selectedTypes,
      requireAllAnswers,
      minTimeLimit: minTimeLimitEnabled ? minTotalSecs : null,
      negativeMarking: negativeMarkingEnabled ? (parseFloat(negativeMarks) || 0) : 0,
    }

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      <div className="text-center mb-6">
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% auto" }}
        >
          Generate Your Quiz
        </motion.h1>
        <p className="text-slate-400 text-base">Design your perfect AI-powered challenge instantly.</p>
      </div>

      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl px-5 py-4"
          >
            <WifiOff className="w-5 h-5" />
            You are offline. Please check your internet connection.
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-300">Your Name</label>
            <Input
              type="text"
              placeholder="e.g. Jane Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-lg font-medium transition-shadow duration-300 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            />
          </div>

          <TopicSelector topic={topic} onChange={setTopic} onEnter={handleSubmit} />
          <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
          <QuestionTypeSelector selectedTypes={selectedTypes} onToggle={toggleType} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#0a0f1e]/50 p-6 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-slate-300">Total Questions</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={5} max={20} value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 hover:accent-indigo-400 transition-all cursor-pointer h-2 bg-[#1a2035] rounded-full appearance-none"
                />
                <span className="text-lg font-mono font-bold w-8 text-indigo-400">{questionCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-slate-300">Total Marks</label>
              <Input
                type="number" min={1} max={100} value={totalMarks}
                className="font-mono text-lg"
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseInt(val)
                  setTotalMarks(isNaN(num) ? "" : Math.min(Math.max(0, num), 100).toString())
                }}
              />
            </div>
          </div>

          <AdvancedSettings 
            timerEnabled={timerEnabled} setTimerEnabled={setTimerEnabled}
            timerHours={timerHours} setTimerHours={setTimerHours}
            timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
            timerSeconds={timerSeconds} setTimerSeconds={setTimerSeconds}
            hintsEnabled={hintsEnabled} setHintsEnabled={setHintsEnabled}
            aiChatEnabled={aiChatEnabled} setAiChatEnabled={setAiChatEnabled}
            requireAllAnswers={requireAllAnswers} setRequireAllAnswers={setRequireAllAnswers}
            minTimeLimitEnabled={minTimeLimitEnabled} setMinTimeLimitEnabled={setMinTimeLimitEnabled}
            minTimeHours={minTimeHours} setMinTimeHours={setMinTimeHours}
            minTimeMinutes={minTimeMinutes} setMinTimeMinutes={setMinTimeMinutes}
            minTimeSeconds={minTimeSeconds} setMinTimeSeconds={setMinTimeSeconds}
            negativeMarkingEnabled={negativeMarkingEnabled} setNegativeMarkingEnabled={setNegativeMarkingEnabled}
            negativeMarks={negativeMarks} setNegativeMarks={setNegativeMarks}
          />

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl px-5 py-4"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            className="w-full text-lg h-16 shadow-[0_0_30px_rgba(59,130,246,0.3)] mt-4 group overflow-hidden relative"
            onClick={handleSubmit} 
            disabled={isLoading || !isOnline}
            isLoading={isLoading}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]" />
            {isLoading ? "Generating Quiz Elements..." : "Generate Quiz"}
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  )
}
