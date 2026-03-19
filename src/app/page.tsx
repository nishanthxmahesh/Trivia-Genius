import { QuizSetupForm } from "@/components/quiz-setup/QuizSetupForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-start md:items-center justify-center p-4 py-8 md:py-24 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="relative z-10 w-full">
        <QuizSetupForm />
      </div>
    </main>
  )
}