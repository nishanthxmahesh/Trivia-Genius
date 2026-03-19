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
  const { setConfig, setQuestions, setLoading, setError, isLoading, error } = useQuizStore()

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
    
    const totalSecs = getTotalSeconds()
    if (timerEnabled && totalSecs < 10) { setError("Timer must be at least 10 seconds."); return }

    setError(null)
    setLoading(true)

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto flex flex-col gap-6"
    >
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          AI Quiz Maker
        </h1>
        <p className="text-gray-400 font-medium text-lg">Test your knowledge on any topic instantly.</p>
      </div>

      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl px-4 py-3"
          >
            <WifiOff className="w-4 h-4" />
            You are offline. Please check your internet connection.
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-6 md:p-8 flex flex-col gap-8">
          
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-300">Your Name</label>
            <Input
              type="text"
              placeholder="e.g. Jane Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <TopicSelector topic={topic} onChange={setTopic} onEnter={handleSubmit} />
          
          <QuestionTypeSelector selectedTypes={selectedTypes} onToggle={toggleType} />

          <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-300">Total Questions</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={5} max={20} value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-sm font-bold w-6 text-right text-blue-400">{questionCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-300">Total Marks</label>
              <Input
                type="number" min={1} max={100} value={totalMarks}
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
          />

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            className="w-full font-bold text-lg h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-xl"
            onClick={handleSubmit} 
            disabled={isLoading || !isOnline}
            isLoading={isLoading}
          >
            {isLoading ? "Generating Quiz Elements..." : "Create My Quiz"}
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  )
}
