import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Question, QuizAttempt, QuizConfig, QuestionHintInfo, QuestionType } from "@/types/quiz"
import { supabase } from "@/lib/supabase"

type QuizStore = {
  config: QuizConfig | null
  questions: Question[]
  currentIndex: number
  userAnswers: Record<string, string>
  questionTimings: Record<string, number>
  questionHints: Record<string, QuestionHintInfo>
  startTime: number | null
  questionStartTime: number | null
  isLoading: boolean
  error: string | null
  history: QuizAttempt[]
  isQuizActive: boolean
  isSyncing: boolean
  customTopics: string[]

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
  addHint: (questionId: string, hint: string) => void
  resetQuiz: () => void
  addCustomTopic: (topic: string) => void
  deleteAttempt: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      config: null,
      questions: [],
      currentIndex: 0,
      userAnswers: {},
      questionTimings: {},
      questionHints: {},
      startTime: null,
      questionStartTime: null,
      isLoading: false,
      error: null,
      history: [],
      isQuizActive: false,
      isSyncing: false,
      customTopics: [],

      setConfig: (config) => set({ config }),
      setQuestions: (questions) =>
        set({
          questions,
          currentIndex: 0,
          userAnswers: {},
          questionTimings: {},
          questionHints: {},
          startTime: Date.now(),
          questionStartTime: Date.now(),
          isQuizActive: true,
        }),
      answerQuestion: (questionId, answer) =>
        set((state) => {
          if (answer === "") {
            const updated = { ...state.userAnswers }
            delete updated[questionId]
            return { userAnswers: updated }
          }
          return { userAnswers: { ...state.userAnswers, [questionId]: answer } }
        }),
      addHint: (questionId, hint) =>
        set((state) => {
          const existing = state.questionHints[questionId] || {
            hintsUsed: 0, hints: [], penaltyPercent: 0,
          }
          const newHintsUsed = existing.hintsUsed + 1
          const penaltyPercent = newHintsUsed === 1 ? 25 : newHintsUsed === 2 ? 50 : 75
          return {
            questionHints: {
              ...state.questionHints,
              [questionId]: {
                hintsUsed: newHintsUsed,
                hints: [...existing.hints, hint],
                penaltyPercent,
              },
            },
          }
        }),
      recordQuestionTime: (questionId) => {
        const state = get()
        if (!state.questionStartTime) return
        const elapsed = Math.floor((Date.now() - state.questionStartTime) / 1000)
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
        set((state) => ({ history: [attempt, ...state.history] }))
        try {
          await supabase.from("quiz_attempts").insert({
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
            total_marks: attempt.totalMarks,
            earned_marks: attempt.earnedMarks,
            question_hints: attempt.questionHints,
            hints_enabled: attempt.hintsEnabled,
            ai_chat_enabled: attempt.aiChatEnabled,
            username: attempt.username,
            question_types: attempt.questionTypes,
            require_all_answers: attempt.requireAllAnswers,
            min_time_limit: attempt.minTimeLimit,
            negative_marking: attempt.negativeMarking
          })

          // Save to leaderboard
          await supabase.from("leaderboard").insert({
            id: attempt.id,
            username: attempt.username,
            topic: attempt.topic,
            difficulty: attempt.difficulty,
            score: attempt.score,
            total: attempt.total,
            earned_marks: attempt.earnedMarks,
            total_marks: attempt.totalMarks,
            percentage: Math.max(0, Math.round((attempt.earnedMarks / attempt.totalMarks) * 100)),
            time_taken: attempt.timeTaken,
            date: attempt.date,
          })
        } catch (err) {
          console.error("Failed to save:", err)
        }
      },
      loadHistory: async () => {
        set({ isSyncing: true })
        try {
          const { data, error } = await supabase
            .from("quiz_attempts")
            .select("*")
            .order("created_at", { ascending: false })
          if (error) { console.error("Supabase load error:", error); return }
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
              totalMarks: row.total_marks || 100,
              earnedMarks: row.earned_marks || row.score,
              questionHints: row.question_hints || {},
              hintsEnabled: row.hints_enabled || false,
              aiChatEnabled: row.ai_chat_enabled || false,
              username: row.username || "Anonymous",
              questionTypes: row.question_types || ["mcq"],
              requireAllAnswers: row.require_all_answers || false,
              minTimeLimit: row.min_time_limit || null,
              negativeMarking: row.negative_marking || false,
            }))
            set({ history: attempts })
          }
        } catch (err) {
          console.error("Failed to load:", err)
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
          questionHints: {},
          startTime: null,
          questionStartTime: null,
          error: null,
          isQuizActive: false,
        }),
      addCustomTopic: (topic) =>
        set((state) => {
          const t = topic.trim()
          if (!t || state.customTopics.includes(t)) return {}
          return { customTopics: [t, ...state.customTopics] }
        }),
      deleteAttempt: async (id) => {
        set((state) => ({ history: state.history.filter((a) => a.id !== id) }))
        try {
          await supabase.from("quiz_attempts").delete().eq("id", id)
          await supabase.from("leaderboard").delete().eq("id", id)
        } catch (err) { console.error("Failed to delete local entry", err) }
      },
      clearHistory: async () => {
        const state = get()
        set({ history: [] })
        try {
          const ids = state.history.map(a => a.id)
          await supabase.from("quiz_attempts").delete().in("id", ids)
          await supabase.from("leaderboard").delete().in("id", ids)
        } catch (err) { console.error("Failed to clear local entries", err) }
      },
    }),
    {
      name: "quiz-storage",
      partialize: (state) => ({
        history: state.history,
        questions: state.questions,
        currentIndex: state.currentIndex,
        userAnswers: state.userAnswers,
        questionTimings: state.questionTimings,
        questionHints: state.questionHints,
        startTime: state.startTime,
        questionStartTime: state.questionStartTime,
        config: state.config,
        isQuizActive: state.isQuizActive,
        customTopics: state.customTopics,
      }),
    }
  )
)