"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { QuizAttempt } from "@/types/quiz"

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const { history, resetQuiz, setConfig, setQuestions } = useQuizStore()
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    const found = history.find((a) => a.id === id)
    if (!found) {
      router.push("/")
      return
    }
    setAttempt(found)
  }, [history, id, router])

  if (!attempt) return null

  const percentage = Math.round((attempt.score / attempt.total) * 100)
  const minutes = Math.floor(attempt.timeTaken / 60)
  const seconds = attempt.timeTaken % 60

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-400"
    if (percentage >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreMessage = () => {
    if (percentage >= 80) return "Excellent work! 🎉"
    if (percentage >= 50) return "Good effort! 👍"
    return "Keep practicing! 💪"
  }

  const formatQuestionTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const handleRetake = () => {
    resetQuiz()
    setConfig({
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      questionCount: attempt.total,
      timerEnabled: attempt.timerEnabled,
      timerSeconds: attempt.timerSeconds,
    })
    setQuestions(attempt.questions)
    router.push("/quiz")
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Score Card */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h1>
          <p className="text-gray-400 mb-6">{getScoreMessage()}</p>

          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
            {percentage}%
          </div>
          <p className="text-gray-400 mb-6">
            {attempt.score} out of {attempt.total} correct
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Topic</p>
              <p className="text-sm font-medium text-white capitalize">
                {attempt.topic}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Difficulty</p>
              <p className="text-sm font-medium text-white">
                {attempt.difficulty}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Time</p>
              <p className="text-sm font-medium text-white">
                {minutes}m {seconds}s
              </p>
            </div>
          </div>
        </div>

        {/* Review Toggle */}
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium py-3 rounded-xl transition-colors mb-4"
        >
          {showReview ? "Hide Review" : "Review Answers"}
        </button>

        {/* Answer Review */}
        {showReview && (
          <div className="flex flex-col gap-3 mb-4">
            {attempt.questions.map((question, index) => {
              const userAnswer = attempt.userAnswers[question.id]
              const isCorrect = userAnswer === question.correctAnswer
              const timeTaken = attempt.questionTimings?.[question.id] || 0

              return (
                <div key={question.id} className="bg-gray-900 rounded-2xl p-4">
                  {/* Question Header */}
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm text-gray-400">
                      Question {index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Time taken */}
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">
                        ⏱ {formatQuestionTime(timeTaken)}
                      </span>
                      {/* Correct/Wrong badge */}
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                        isCorrect
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {isCorrect ? "Correct" : "Wrong"}
                      </span>
                    </div>
                  </div>

                  <p className="text-white text-sm font-medium mb-3">
                    {question.text}
                  </p>

                  <div className="flex flex-col gap-2">
                    {question.options.map((option, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-xl text-sm ${
                          option === question.correctAnswer
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : option === userAnswer && !isCorrect
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {option}
                        {option === question.correctAnswer && " ✓"}
                        {option === userAnswer && !isCorrect && " ✗"}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRetake}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => { resetQuiz(); router.push("/") }}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
          >
            New Quiz
          </button>
        </div>

        <button
          onClick={() => router.push("/history")}
          className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          View Quiz History
        </button>
      </div>
    </main>
  )
}