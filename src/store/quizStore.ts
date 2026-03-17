import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Question, QuizAttempt, QuizConfig } from "@/types/quiz"

type QuizStore = {
  config: QuizConfig | null
  questions: Question[]
  currentIndex: number
  userAnswers: Record<string, string>
  questionTimings: Record<string, number>
  startTime: number | null
  questionStartTime: number | null
  isLoading: boolean
  error: string | null
  history: QuizAttempt[]
  isQuizActive: boolean

  setConfig: (config: QuizConfig) => void
  setQuestions: (questions: Question[]) => void
  answerQuestion: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setCurrentIndex: (index: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  saveAttempt: (attempt: QuizAttempt) => void
  recordQuestionTime: (questionId: string) => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      config: null,
      questions: [],
      currentIndex: 0,
      userAnswers: {},
      questionTimings: {},
      startTime: null,
      questionStartTime: null,
      isLoading: false,
      error: null,
      history: [],
      isQuizActive: false,

      setConfig: (config) => set({ config }),
      setQuestions: (questions) =>
        set({
          questions,
          currentIndex: 0,
          userAnswers: {},
          questionTimings: {},
          startTime: Date.now(),
          questionStartTime: Date.now(),
          isQuizActive: true,
        }),
      answerQuestion: (questionId, answer) =>
        set((state) => ({
          userAnswers: { ...state.userAnswers, [questionId]: answer },
        })),
      recordQuestionTime: (questionId) => {
        const state = get()
        if (!state.questionStartTime) return
        const elapsed = Math.floor(
          (Date.now() - state.questionStartTime) / 1000
        )
        set((s) => ({
          questionTimings: {
            ...s.questionTimings,
            [questionId]: (s.questionTimings[questionId] || 0) + elapsed,
          },
          questionStartTime: Date.now(),
        }))
      },
      nextQuestion: () => {
        const state = get()
        const currentQuestion = state.questions[state.currentIndex]
        if (currentQuestion) state.recordQuestionTime(currentQuestion.id)
        set((s) => ({ currentIndex: s.currentIndex + 1 }))
      },
      prevQuestion: () => {
        const state = get()
        const currentQuestion = state.questions[state.currentIndex]
        if (currentQuestion) state.recordQuestionTime(currentQuestion.id)
        set((s) => ({ currentIndex: s.currentIndex - 1 }))
      },
      setCurrentIndex: (index) => {
        const state = get()
        const currentQuestion = state.questions[state.currentIndex]
        if (currentQuestion) state.recordQuestionTime(currentQuestion.id)
        set({ currentIndex: index })
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      saveAttempt: (attempt) =>
        set((state) => ({ history: [attempt, ...state.history] })),
      resetQuiz: () =>
        set({
          config: null,
          questions: [],
          currentIndex: 0,
          userAnswers: {},
          questionTimings: {},
          startTime: null,
          questionStartTime: null,
          error: null,
          isQuizActive: false,
        }),
    }),
    {
      name: "quiz-storage",
      partialize: (state) => ({ history: state.history }),
    }
  )
)