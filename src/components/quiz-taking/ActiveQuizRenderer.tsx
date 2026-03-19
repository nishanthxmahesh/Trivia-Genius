"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { QuizAttempt } from "@/types/quiz"
import { QuestionCard } from "./QuestionCard"
import { QuestionNavigator } from "./QuestionNavigator"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"

export function ActiveQuizRenderer({ setCompletedAttempt }: { setCompletedAttempt: (a: QuizAttempt) => void }) {
  const router = useRouter()
  const {
    questions, currentIndex, userAnswers, config,
    nextQuestion, prevQuestion, saveAttempt, resetQuiz, startTime,
    questionHints, addHint, setCurrentIndex
  } = useQuizStore()

  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set())
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  
  useEffect(() => {
    if (questions.length === 0) router.push("/")
  }, [questions, router])

  useEffect(() => {
    if (questions.length > 0) {
      setVisitedQuestions((prev) => new Set([...prev, questions[currentIndex].id]))
    }
  }, [currentIndex, questions])

  useEffect(() => {
    if (config?.timerEnabled && config?.timerSeconds) setTimeLeft(config.timerSeconds)
  }, [config])

  const handleFinish = useCallback(() => {
    const state = useQuizStore.getState()
    const currentQuestion = state.questions[state.currentIndex]
    if (currentQuestion) state.recordQuestionTime(currentQuestion.id)
    if (!state.config) return

    let correctCount = 0
    let earnedMarks = 0
    const marksPerQ = state.config.totalMarks / state.questions.length

    state.questions.forEach((q) => {
      const userAnswer = state.userAnswers[q.id] || ""
      let isCorrect = q.type === "fillintheblank" 
        ? userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        : userAnswer === q.correctAnswer

      if (isCorrect) {
        correctCount++
        const penalty = state.questionHints[q.id]?.penaltyPercent || 0
        earnedMarks += marksPerQ * (1 - penalty / 100)
      }
    })

    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      topic: state.config.topic,
      difficulty: state.config.difficulty,
      score: correctCount,
      total: state.questions.length,
      totalMarks: state.config.totalMarks,
      earnedMarks: Math.round(earnedMarks * 10) / 10,
      timeTaken: state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0,
      date: new Date().toISOString(),
      questions: state.questions,
      userAnswers: state.userAnswers,
      questionTimings: state.questionTimings,
      questionHints: state.questionHints,
      timerEnabled: state.config.timerEnabled,
      timerSeconds: state.config.timerSeconds,
      hintsEnabled: state.config.hintsEnabled,
      aiChatEnabled: state.config.aiChatEnabled,
      username: state.config.username,
      questionTypes: state.config.questionTypes,
    }

    saveAttempt(attempt)
    setCompletedAttempt(attempt)
  }, [saveAttempt, setCompletedAttempt])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { handleFinish(); return }
    const interval = setInterval(() => setTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, handleFinish])

  if (questions.length === 0) return null

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex === totalQuestions - 1

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}` : `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const handleHintClick = async () => {
    const existingHints = questionHints[question.id]
    const currentHintLevel = existingHints?.hintsUsed || 0
    if (currentHintLevel >= 3 || !config) return
    const nextHintLevel = currentHintLevel + 1
    
    setHintLoading(true)
    try {
      const response = await fetch("/api/hint", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.text, options: question.options, topic: config.topic, difficulty: config.difficulty, hintLevel: nextHintLevel })
      })
      const data = await response.json()
      if (response.ok) addHint(question.id, data.hint)
    } finally { setHintLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 p-4 py-8">
      <div className="flex-1 flex flex-col tracking-tight">
        
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <p className="text-gray-400 font-bold mb-1 uppercase tracking-wider text-xs">{config?.topic} • {config?.difficulty}</p>
            <h2 className="text-2xl font-black">Question {currentIndex + 1} <span className="text-gray-500 font-semibold text-lg">/ {totalQuestions}</span></h2>
          </div>
          {timeLeft !== null && (
            <div className={`px-4 py-2 rounded-xl font-bold bg-gray-900 border ${timeLeft <= 60 ? "border-red-500 text-red-500 animate-pulse" : "border-gray-800 text-gray-300"}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <ProgressBar progress={progress} className="mb-8" />

        <QuestionCard 
          question={question} currentIndex={currentIndex} totalQuestions={totalQuestions}
          marksPerQuestion={config ? config.totalMarks / totalQuestions : 0}
          hintsUsedForCurrent={questionHints[question.id]?.hintsUsed || 0}
          allHintsForCurrent={questionHints[question.id]?.hints || []}
          markedQuestions={markedQuestions}
          toggleMark={() => setMarkedQuestions(prev => { const n = new Set(prev); n.has(question.id) ? n.delete(question.id) : n.add(question.id); return n; })}
          handleHint={handleHintClick}
          hintLoading={hintLoading}
          shownHintLevel={questionHints[question.id]?.hintsUsed || 0}
        />

        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={prevQuestion} disabled={currentIndex === 0} className="w-1/3">
            Previous
          </Button>
          {isLastQuestion ? (
            <Button onClick={handleFinish} className="w-2/3 bg-green-600 hover:bg-green-500 text-white font-bold">
              Submit Exam
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="w-2/3 font-bold">
              Next Question
            </Button>
          )}
        </div>

      </div>
      
      <QuestionNavigator 
        questions={questions}
        currentIndex={currentIndex}
        markedQuestions={markedQuestions}
        visitedQuestions={visitedQuestions}
        handleFinish={handleFinish}
      />
    </div>
  )
}
