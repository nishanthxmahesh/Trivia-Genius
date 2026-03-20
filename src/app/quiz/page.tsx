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
      <div className="w-full">
        <ResultsOverview attempt={completedAttempt} onRetake={() => setCompletedAttempt(null)} />
      </div>
    )
  }

  return (
    <div className="w-full">
      <ActiveQuizRenderer setCompletedAttempt={setCompletedAttempt} />
    </div>
  )
}