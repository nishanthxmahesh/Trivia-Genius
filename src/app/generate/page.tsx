import { QuizSetupForm } from "@/components/quiz-setup/QuizSetupForm"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function GenerateQuiz() {
  return (
    <main className="min-h-screen text-slate-300 flex items-start md:items-center justify-center p-4 py-8 md:py-24 overflow-x-hidden relative">
      <AnimatedBackground />
      <div className="relative z-10 w-full">
        <QuizSetupForm />
      </div>
    </main>
  )
}
