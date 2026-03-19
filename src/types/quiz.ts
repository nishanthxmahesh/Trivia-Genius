export type QuestionType = "mcq" | "truefalse" | "fillintheblank"

export type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  type: QuestionType
  explanation?: string
}

export type QuestionHintInfo = {
  hintsUsed: number
  hints: string[]
  penaltyPercent: number
}

export type QuizAttempt = {
  id: string
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  score: number
  total: number
  totalMarks: number
  earnedMarks: number
  timeTaken: number
  date: string
  questions: Question[]
  userAnswers: Record<string, string>
  questionTimings: Record<string, number>
  questionHints: Record<string, QuestionHintInfo>
  timerEnabled: boolean
  timerSeconds: number | null
  hintsEnabled: boolean
  aiChatEnabled: boolean
  username: string
  questionTypes: QuestionType[]
}

export type QuizConfig = {
  topic: string
  questionCount: number
  difficulty: "Easy" | "Medium" | "Hard"
  timerEnabled: boolean
  timerSeconds: number | null
  totalMarks: number
  hintsEnabled: boolean
  aiChatEnabled: boolean
  username: string
  questionTypes: QuestionType[]
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type LeaderboardEntry = {
  id: string
  username: string
  topic: string
  difficulty: string
  score: number
  total: number
  earnedMarks: number
  totalMarks: number
  percentage: number
  timeTaken: number
  date: string
}