"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { QuizAttempt } from "@/types/quiz"

export default function QuizPage() {
  const router = useRouter()
  const {
    questions,
    currentIndex,
    userAnswers,
    config,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    saveAttempt,
    resetQuiz,
    startTime,
    setCurrentIndex,
  } = useQuizStore()

  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set())
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    if (questions.length === 0 && !completedAttempt) {
      router.push("/")
    }
  }, [questions, router, completedAttempt])

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentIndex]
      setVisitedQuestions((prev) => new Set([...prev, currentQuestion.id]))
    }
  }, [currentIndex, questions])

  useEffect(() => {
    if (config?.timerEnabled && config?.timerSeconds) {
      setTimeLeft(config.timerSeconds)
    }
  }, [config])

  const handleFinish = useCallback(() => {
    const state = useQuizStore.getState()
    const currentQuestion = state.questions[state.currentIndex]
    if (currentQuestion) state.recordQuestionTime(currentQuestion.id)

    let score = 0
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) score++
    })

    const timeTaken = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0

    const finalTimings = useQuizStore.getState().questionTimings

    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      topic: config!.topic,
      difficulty: config!.difficulty,
      score,
      total: questions.length,
      timeTaken,
      date: new Date().toISOString(),
      questions,
      userAnswers,
      questionTimings: finalTimings,
      timerEnabled: config!.timerEnabled,
      timerSeconds: config!.timerSeconds,
    }

    saveAttempt(attempt)
    resetQuiz()
    setShowSubmitModal(false)
    setCompletedAttempt(attempt)
  }, [questions, userAnswers, startTime, config, saveAttempt, resetQuiz])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      handleFinish()
      return
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, handleFinish])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const formatShortTime = (s: number) =>
    s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`

  const toggleMark = () => {
    if (questions.length === 0) return
    const question = questions[currentIndex]
    setMarkedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(question.id)) {
        next.delete(question.id)
      } else {
        next.add(question.id)
      }
      return next
    })
  }

  const getQuestionStatus = (q: { id: string }) => {
    if (markedQuestions.has(q.id)) return "marked"
    if (userAnswers[q.id]) return "answered"
    if (visitedQuestions.has(q.id)) return "visited"
    return "unopened"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-500 text-white"
      case "visited": return "bg-red-500 text-white"
      case "marked": return "bg-purple-500 text-white"
      default: return "bg-blue-900 text-blue-300"
    }
  }

  // ✅ Show results immediately after submit
  if (completedAttempt) {
    const percentage = Math.round(
      (completedAttempt.score / completedAttempt.total) * 100
    )
    const mins = Math.floor(completedAttempt.timeTaken / 60)
    const secs = completedAttempt.timeTaken % 60

    return (
      <div className="min-h-screen bg-gray-950 text-white overflow-y-auto">
        <div className="max-w-xl mx-auto p-4 py-8">

          {/* Score Card */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Exam Submitted! 🎉
            </h1>
            <p className="text-gray-400 mb-6">
              {percentage >= 80
                ? "Excellent work!"
                : percentage >= 50
                ? "Good effort!"
                : "Keep practicing!"}
            </p>

            <div className={`text-6xl font-bold mb-2 ${
              percentage >= 80
                ? "text-green-400"
                : percentage >= 50
                ? "text-yellow-400"
                : "text-red-400"
            }`}>
              {percentage}%
            </div>
            <p className="text-gray-400 mb-6">
              {completedAttempt.score} out of {completedAttempt.total} correct
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Topic</p>
                <p className="text-sm font-medium text-white capitalize">
                  {completedAttempt.topic}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                <p className="text-sm font-medium text-white">
                  {completedAttempt.difficulty}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Time</p>
                <p className="text-sm font-medium text-white">
                  {mins}m {secs}s
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
              {completedAttempt.questions.map((q, index) => {
                const userAnswer = completedAttempt.userAnswers[q.id]
                const isCorrect = userAnswer === q.correctAnswer
                const timeTaken = completedAttempt.questionTimings?.[q.id] || 0

                return (
                  <div key={q.id} className="bg-gray-900 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-gray-400">
                        Question {index + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">
                          ⏱ {formatShortTime(timeTaken)}
                        </span>
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
                      {q.text}
                    </p>

                    <div className="flex flex-col gap-2">
                      {q.options.map((option, i) => (
                        <div
                          key={i}
                          className={`px-3 py-2 rounded-xl text-sm ${
                            option === q.correctAnswer
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : option === userAnswer && !isCorrect
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {option}
                          {option === q.correctAnswer && " ✓"}
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
              onClick={() => {
                resetQuiz()
                setCompletedAttempt(null)
                router.push("/")
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              New Quiz
            </button>
            <button
              onClick={() => router.push("/history")}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) return null

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex === totalQuestions - 1
  const selectedAnswer = userAnswers[question.id]
  const answeredCount = Object.keys(userAnswers).length
  const unansweredCount = totalQuestions - answeredCount
  const timerWarning = timeLeft !== null && timeLeft <= 60

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto flex gap-4">

        {/* Left - Main Quiz */}
        <div className="flex-1 flex flex-col">

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
                  timerWarning
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-gray-800 text-white"
                }`}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeLeft)}
                </div>
              )}
              <span className="text-gray-400 text-sm capitalize">
                {config?.topic} • {config?.difficulty}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold text-white flex-1 pr-4">
                {question.text}
              </h2>
              <button
                onClick={toggleMark}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  markedQuestions.has(question.id)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {markedQuestions.has(question.id) ? "★ Marked" : "☆ Mark"}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => answerQuestion(question.id, option)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    selectedAnswer === option
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span className="text-gray-500 mr-2">
                    {["A", "B", "C", "D"][index]}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            {isLastQuestion ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                Finish Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Next
              </button>
            )}
          </div>

          <button
            onClick={() => { resetQuiz(); router.push("/") }}
            className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Quit Quiz
          </button>
        </div>

        {/* Right - Question Navigation Panel */}
        <div className="w-64 shrink-0 hidden md:flex flex-col gap-3">
          <div className="bg-gray-900 rounded-2xl p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Question Navigator
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q)
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-10 h-10 rounded-lg text-xs font-semibold transition-colors ${
                      currentIndex === index
                        ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900"
                        : ""
                    } ${getStatusColor(status)}`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-gray-800 pt-3 flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Legend</p>
              {[
                { color: "bg-green-500", label: "Answered" },
                { color: "bg-red-500", label: "Visited, not answered" },
                { color: "bg-purple-500", label: "Marked for review" },
                { color: "bg-blue-900", label: "Not opened" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-3 mt-3 grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{answeredCount}</p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-400">{unansweredCount}</p>
                <p className="text-xs text-gray-500">Remaining</p>
              </div>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="md:hidden fixed bottom-20 right-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Nav Panel */}
        {navOpen && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-10">
            <div className="grid grid-cols-8 gap-2 mb-3">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q)
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(index)
                      setNavOpen(false)
                    }}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold ${
                      currentIndex === index
                        ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900"
                        : ""
                    } ${getStatusColor(status)}`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => { setNavOpen(false); setShowSubmitModal(true) }}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Submit Exam
            </button>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-1">
              Submit Exam?
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Review your question status before submitting.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-5">
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-400">{answeredCount}</p>
                <p className="text-xs text-gray-500 mt-1">Answered</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-red-400">{unansweredCount}</p>
                <p className="text-xs text-gray-500 mt-1">Unanswered</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-purple-400">
                  {markedQuestions.size}
                </p>
                <p className="text-xs text-gray-500 mt-1">Marked</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{totalQuestions}</p>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q)
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(index)
                      setShowSubmitModal(false)
                    }}
                    className={`w-full h-10 rounded-lg text-xs font-semibold transition-colors ${getStatusColor(status)}`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { color: "bg-green-500", label: "Answered" },
                { color: "bg-red-500", label: "Not answered" },
                { color: "bg-purple-500", label: "Marked" },
                { color: "bg-blue-900", label: "Not opened" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>

            {unansweredCount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm rounded-xl px-4 py-3 mb-4">
                ⚠️ {unansweredCount} question{unansweredCount > 1 ? "s" : ""} unanswered. Click any question above to go back to it.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}