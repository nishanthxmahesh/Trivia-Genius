import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Question, QuizAttempt, QuizConfig } from "@/types/quiz"
import { supabase } from "@/lib/supabase"

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
  isSyncing: boolean

  setConfig: (config: QuizConfig) => void
  setQuestions: (questions: Question[]) => void
  answerQuestion: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setCurrentIndex: (index: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  saveAttempt: (attempt: QuizAttempt) => void
  loadHistory: () => Promise<void>
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
      isSyncing: false,

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

      saveAttempt: async (attempt) => {
        // Save to local state immediately
        set((state) => ({ history: [attempt, ...state.history] }))

        // Save to Supabase in background
        try {
          const { error } = await supabase.from("quiz_attempts").insert({
            id: attempt.id,
            topic: attempt.topic,
            difficulty: attempt.difficulty,
            score: attempt.score,
            total: attempt.total,
            time_taken: attempt.timeTaken,
            date: attempt.date,
            questions: attempt.questions,
            user_answers: attempt.userAnswers,
            question_timings: attempt.questionTimings,
            timer_enabled: attempt.timerEnabled,
            timer_seconds: attempt.timerSeconds,
          })
          if (error) console.error("Supabase save error:", error)
        } catch (err) {
          console.error("Failed to save to Supabase:", err)
        }
      },

      loadHistory: async () => {
        set({ isSyncing: true })
        try {
          const { data, error } = await supabase
            .from("quiz_attempts")
            .select("*")
            .order("created_at", { ascending: false })

          if (error) {
            console.error("Supabase load error:", error)
            return
          }

          if (data) {
            const attempts: QuizAttempt[] = data.map((row) => ({
              id: row.id,
              topic: row.topic,
              difficulty: row.difficulty,
              score: row.score,
              total: row.total,
              timeTaken: row.time_taken,
              date: row.date,
              questions: row.questions,
              userAnswers: row.user_answers,
              questionTimings: row.question_timings,
              timerEnabled: row.timer_enabled,
              timerSeconds: row.timer_seconds,
            }))
            set({ history: attempts })
          }
        } catch (err) {
          console.error("Failed to load from Supabase:", err)
        } finally {
          set({ isSyncing: false })
        }
      },

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
      partialize: (state) => ({
        history: state.history,
        questions: state.questions,
        currentIndex: state.currentIndex,
        userAnswers: state.userAnswers,
        questionTimings: state.questionTimings,
        startTime: state.startTime,
        questionStartTime: state.questionStartTime,
        config: state.config,
        isQuizActive: state.isQuizActive,
      }),
    }
  )
)