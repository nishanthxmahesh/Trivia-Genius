"use client"

import { useState } from "react"
import { useQuizStore } from "@/store/quizStore"
import { QuizAttempt } from "@/types/quiz"
import { ActiveQuizRenderer } from "@/components/quiz-taking/ActiveQuizRenderer"
import { ResultsOverview } from "@/components/quiz-results/ResultsOverview"

export default function QuizPage() {
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null)
  
  if (completedAttempt) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <ResultsOverview attempt={completedAttempt} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white selection:bg-blue-500/30 font-sans">
      <ActiveQuizRenderer setCompletedAttempt={setCompletedAttempt} />
    </main>
  )
}