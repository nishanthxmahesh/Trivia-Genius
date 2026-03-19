"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { QuizAttempt } from "@/types/quiz"
import AIChat from "@/components/AIChat"
import { ExplanationButton } from "./ExplanationButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"

export function ResultsOverview({ attempt }: { attempt: QuizAttempt }) {
  const router = useRouter()
  const { resetQuiz } = useQuizStore()
  const [showReview, setShowReview] = useState(false)

  const percentage = Math.round((attempt.score / attempt.total) * 100)
  const mins = Math.floor(attempt.timeTaken / 60)
  const secs = attempt.timeTaken % 60
  const marksPerQuestion = attempt.totalMarks / attempt.total
  const totalHintsUsed = Object.values(attempt.questionHints || {}).reduce((acc, h) => acc + h.hintsUsed, 0)

  const formatShortTime = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`)

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-3xl mx-auto p-4 py-8"
    >
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 mb-6 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Exam Submitted! 🎉
        </h1>
        <p className="text-gray-400 mb-2 font-medium">
          {percentage >= 80 ? "Excellent work!" : percentage >= 50 ? "Good effort!" : "Keep practicing!"}
        </p>
        <p className="text-blue-400 text-sm mb-6 font-semibold">— {attempt.username}</p>

        <div className={`text-7xl font-black mb-2 ${
          percentage >= 80 ? "text-green-400" : percentage >= 50 ? "text-yellow-400" : "text-red-400"
        }`}>
          {attempt.earnedMarks}
          <span className="text-3xl text-gray-500 font-bold">/{attempt.totalMarks}</span>
        </div>
        <p className="text-gray-400 text-sm mb-6 font-medium">
          {attempt.score} out of {attempt.total} correct ({percentage}%)
        </p>

        {totalHintsUsed > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl px-4 py-3 mb-6 font-medium inline-block mx-auto">
            💡 Used {totalHintsUsed} hint{totalHintsUsed > 1 ? "s" : ""} — marks deducted
          </div>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <div className="bg-gray-800/80 rounded-2xl px-5 py-4 text-center border border-gray-700">
            <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Topic</p>
            <p className="text-sm font-bold capitalize text-gray-100">{attempt.topic}</p>
          </div>
          <div className="bg-gray-800/80 rounded-2xl px-5 py-4 text-center border border-gray-700">
            <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Difficulty</p>
            <p className="text-sm font-bold text-gray-100">{attempt.difficulty}</p>
          </div>
          <div className="bg-gray-800/80 rounded-2xl px-5 py-4 text-center border border-gray-700">
            <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Time</p>
            <p className="text-sm font-bold text-gray-100">{mins}m {secs}s</p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => setShowReview(!showReview)}
        className="w-full mb-6 font-semibold h-14 bg-gray-900 border-gray-800 hover:bg-gray-800 hover:text-white"
      >
        {showReview ? "Hide Review" : "Review Answers"}
      </Button>

      {showReview && (
        <div className="flex flex-col gap-4 mb-6">
          {attempt.questions.map((q, index) => {
            const userAnswer = attempt.userAnswers[q.id] || ""
            let isCorrect = false
            if (q.type === "fillintheblank") {
              isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
            } else {
              isCorrect = userAnswer === q.correctAnswer
            }
            const timeTaken = attempt.questionTimings?.[q.id] || 0
            const hintInfo = attempt.questionHints?.[q.id]
            const penaltyPercent = hintInfo?.penaltyPercent || 0
            const earnedForQ = isCorrect ? Math.round(marksPerQuestion * (1 - penaltyPercent / 100) * 10) / 10 : 0
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={q.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 bg-gray-800 px-3 py-1 rounded-lg">Q{index + 1}</span>
                    <Badge variant={q.type === "mcq" ? "default" : q.type === "fillintheblank" ? "warning" : "success"}>
                      {q.type === "mcq" ? "MCQ" : q.type === "fillintheblank" ? "Fill" : "T/F"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-lg">⏱ {formatShortTime(timeTaken)}</span>
                    {hintInfo && hintInfo.hintsUsed > 0 && (
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg">💡 {hintInfo.hintsUsed} hint{hintInfo.hintsUsed > 1 ? "s" : ""}</span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isCorrect ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                      {isCorrect ? `+${earnedForQ}` : "0"}/{Math.round(marksPerQuestion * 10) / 10} marks
                    </span>
                  </div>
                </div>

                <p className="text-white text-base font-medium mb-4">{q.text}</p>

                {q.type === "fillintheblank" ? (
                  <div className="flex flex-col gap-2">
                    <div className={`px-4 py-3 rounded-xl border text-sm font-medium ${isCorrect ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                      Your answer: {userAnswer || "Not answered"} {isCorrect ? " ✓" : " ✗"}
                    </div>
                    {!isCorrect && (
                      <div className="px-4 py-3 rounded-xl border bg-green-500/10 text-green-400 border-green-500/30 text-sm font-medium">
                        Correct: {q.correctAnswer} ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {q.options.map((option, i) => (
                      <div
                        key={i}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium ${
                          option === q.correctAnswer
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : option === userAnswer && !isCorrect
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-gray-800/50 text-gray-400 border-gray-800"
                        }`}
                      >
                        <span className="text-gray-500 mr-3 font-semibold">{["A", "B", "C", "D"][i]}</span>
                        {option}
                        {option === q.correctAnswer && " ✓"}
                        {option === userAnswer && !isCorrect && " ✗"}
                      </div>
                    ))}
                  </div>
                )}

                <ExplanationButton
                  question={q.text}
                  correctAnswer={q.correctAnswer}
                  userAnswer={userAnswer}
                  topic={attempt.topic}
                />
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button onClick={() => { resetQuiz(); router.push("/") }}>New Quiz</Button>
        <Button variant="secondary" onClick={() => router.push("/history")}>View History</Button>
      </div>
      
      <Button variant="outline" className="w-full text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10" onClick={() => router.push("/leaderboard")}>
        🏆 View Leaderboard
      </Button>

      <AIChat visible={attempt.aiChatEnabled} />
    </motion.div>
  )
}
