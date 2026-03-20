"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { QuizAttempt } from "@/types/quiz"
import { QuestionCard } from "./QuestionCard"
import { QuestionNavigator } from "./QuestionNavigator"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Clock } from "lucide-react"

export function ActiveQuizRenderer({ setCompletedAttempt }: { setCompletedAttempt: (a: QuizAttempt) => void }) {
  const router = useRouter()
  const {
    questions, currentIndex, userAnswers, config,
    nextQuestion, prevQuestion, saveAttempt, resetQuiz, startTime,
    questionHints, addHint
  } = useQuizStore()

  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set())
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [timeWarning, setTimeWarning] = useState<string | null>(null)
  

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
      const uAnsStr = state.userAnswers[q.id] || ""
      const isAnswered = uAnsStr !== ""
      
      if (!isAnswered) return

      let isCorrect = false
      let pointsAwarded = 0

      if (q.type === "multiselect") {
        try {
          const correctArr = JSON.parse(q.correctAnswer) as string[]
          const userArr = JSON.parse(uAnsStr) as string[]
          const correctPicks = userArr.filter(u => correctArr.includes(u)).length
          const wrongPicks = userArr.filter(u => !correctArr.includes(u)).length
          
          if (wrongPicks > 0) {
            pointsAwarded = 0
            isCorrect = false
          } else {
            if (correctPicks === correctArr.length) isCorrect = true
            pointsAwarded = marksPerQ * (correctPicks / correctArr.length)
          }
        } catch(e) { pointsAwarded = 0 }
      } 
      else if (q.type === "fillintheblank") {
        isCorrect = uAnsStr.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        pointsAwarded = isCorrect ? marksPerQ : 0
      } 
      else {
        isCorrect = uAnsStr === q.correctAnswer
        pointsAwarded = isCorrect ? marksPerQ : 0
      }

      if (isCorrect) correctCount++

      if (pointsAwarded > 0) {
        const penalty = state.questionHints[q.id]?.penaltyPercent || 0
        earnedMarks += pointsAwarded * (1 - penalty / 100)
      } else if (state.config?.negativeMarking && isAnswered) {
        // Negative marking: deduct exact custom mark configuration
        earnedMarks -= state.config.negativeMarking
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
      requireAllAnswers: state.config.requireAllAnswers,
      minTimeLimit: state.config.minTimeLimit,
      negativeMarking: state.config.negativeMarking,
    }

    saveAttempt(attempt)
    setCompletedAttempt(attempt)
    resetQuiz()
  }, [saveAttempt, setCompletedAttempt, resetQuiz])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { setShowSubmitModal(false); handleFinish(); return }
    const interval = setInterval(() => setTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, handleFinish])

  const handleQuit = () => {
    if (confirm("Are you sure you want to quit? All unsaved progress will be lost!")) {
      resetQuiz()
      router.push("/generate")
    }
  }

  if (questions.length === 0 || !config) {
    return null
  }

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const answeredCount = Object.keys(userAnswers).length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex === totalQuestions - 1

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}` : `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  const canSubmitTime = !config.minTimeLimit || elapsedSeconds >= config.minTimeLimit
  const canSubmitAnswers = !config.requireAllAnswers || answeredCount === totalQuestions
  const isSubmitDisabled = !canSubmitTime || !canSubmitAnswers

  const handlePreSubmit = () => {
    if (!canSubmitTime && config.minTimeLimit) {
      const remaining = config.minTimeLimit - elapsedSeconds
      setTimeWarning(`${formatTime(remaining)} time left before you can submit.`)
      setTimeout(() => setTimeWarning(null), 3000)
      return
    }
    setShowSubmitModal(true)
  }

  const handleHintClick = async () => {
    const existingHints = questionHints[question.id]
    const currentHintLevel = existingHints?.hintsUsed || 0
    if (currentHintLevel >= 3) return
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
    <div className="flex flex-col md:flex-row gap-8 py-8 w-full max-w-[1200px] mx-auto px-4 z-10 relative">
      <AnimatePresence>
        {timeWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 30, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-50 bg-amber-500 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
          >
            <Clock className="w-5 h-5" /> {timeWarning}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col tracking-tight z-10 relative">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-blue-400 font-bold mb-1 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {config.topic} • {config.difficulty}
            </p>
            <h2 className="text-3xl font-black text-white">Question {currentIndex + 1} <span className="text-slate-500 font-semibold text-2xl">/ {totalQuestions}</span></h2>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button onClick={handleQuit} className="text-slate-400 hover:text-red-400 text-sm font-bold opacity-80 hover:opacity-100 transition-colors uppercase tracking-widest">
              Quit Session
            </button>
            {timeLeft !== null && (
              <div className={`px-5 py-2.5 rounded-xl font-mono text-lg font-black tracking-tight border shadow-inner ${timeLeft <= 60 ? "border-red-500/50 bg-red-500/10 text-red-500 animate-[pulse_1s_infinite]" : "border-white/10 bg-[#111827] text-slate-300"}`}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        <ProgressBar progress={progress} className="mb-8" />

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <QuestionCard 
              key={question.id}
              question={question} currentIndex={currentIndex} totalQuestions={totalQuestions}
              marksPerQuestion={config.totalMarks / totalQuestions}
              hintsUsedForCurrent={questionHints[question.id]?.hintsUsed || 0}
              allHintsForCurrent={questionHints[question.id]?.hints || []}
              markedQuestions={markedQuestions}
              toggleMark={() => setMarkedQuestions(prev => { const n = new Set(prev); n.has(question.id) ? n.delete(question.id) : n.add(question.id); return n; })}
              handleHint={handleHintClick}
              hintLoading={hintLoading}
              shownHintLevel={questionHints[question.id]?.hintsUsed || 0}
            />
          </AnimatePresence>
        </div>

        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={prevQuestion} disabled={currentIndex === 0} className="w-1/3 text-slate-300 font-bold">
            Previous
          </Button>
          {isLastQuestion ? (
            <Button 
              onClick={handlePreSubmit} 
              className={`w-2/3 tracking-wide transition-all ${isSubmitDisabled ? "bg-slate-700 hover:bg-slate-700 text-slate-400 shadow-none border-transparent cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"}`}
            >
              Review & Submit
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="w-2/3 font-bold tracking-wide">
              Next Question
            </Button>
          )}
        </div>

        <div className="md:hidden mt-12 mb-8">
          <QuestionNavigator 
            questions={questions}
            currentIndex={currentIndex}
            markedQuestions={markedQuestions}
            visitedQuestions={visitedQuestions}
            handleFinish={handlePreSubmit}
            handleQuit={handleQuit}
            isSubmitDisabled={isSubmitDisabled}
          />
        </div>
      </div>
      
      <div className="hidden md:block md:w-72 lg:w-80 shrink-0 sticky top-12 h-[calc(100vh-6rem)]">
        <QuestionNavigator 
          questions={questions}
          currentIndex={currentIndex}
          markedQuestions={markedQuestions}
          visitedQuestions={visitedQuestions}
          handleFinish={handlePreSubmit}
          handleQuit={handleQuit}
          isSubmitDisabled={isSubmitDisabled}
        />
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0f1e]/80 backdrop-blur-md"
              onClick={() => setShowSubmitModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-2xl font-black text-white mb-2">Submit Quiz?</h3>
              <div className="mb-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold bg-[#1a2035] p-4 rounded-xl border border-white/5">
                  <span className="text-slate-400">Questions Answered</span>
                  <span className={`text-lg font-mono ${answeredCount === totalQuestions ? "text-emerald-400" : "text-amber-400"}`}>{answeredCount} / {totalQuestions}</span>
                </div>
                {answeredCount < totalQuestions && (
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl px-4 py-3 font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>You have {totalQuestions - answeredCount} unanswered {totalQuestions - answeredCount === 1 ? 'question' : 'questions'}. You won't be able to return after submitting.</p>
                  </div>
                )}
                {config.requireAllAnswers && answeredCount < totalQuestions && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>Strict mode is enabled. You MUST answer all questions to submit.</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleFinish} 
                  disabled={config.requireAllAnswers && answeredCount < totalQuestions}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Confirm Submission
                </Button>
                <Button variant="outline" onClick={() => setShowSubmitModal(false)} className="w-full h-14 font-bold border-white/10 text-slate-300">
                  Return to Quiz
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
