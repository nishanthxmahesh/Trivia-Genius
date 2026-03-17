export type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: string
}

export type QuizAttempt = {
  id: string
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  score: number
  total: number
  timeTaken: number
  date: string
  questions: Question[]
  userAnswers: Record<string, string>
  questionTimings: Record<string, number>
  timerEnabled: boolean
  timerSeconds: number | null
}

export type QuizConfig = {
  topic: string
  questionCount: number
  difficulty: "Easy" | "Medium" | "Hard"
  timerEnabled: boolean
  timerSeconds: number | null
}