"use client"
import { useParams, useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { ResultsOverview } from "@/components/quiz-results/ResultsOverview"
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

export default function ResultsPage() {
  const { id } = useParams()
  const router = useRouter()
  const history = useQuizStore((state) => state.history)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const attempt = history.find((a) => a.id === id)

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-300">
        <h2 className="text-2xl font-bold mb-4">Result Not Found</h2>
        <Button onClick={() => router.push("/history")}>Back to History</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12 pt-6 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <Button variant="ghost" onClick={() => router.push("/history")} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
        </Button>
      </div>
      <ResultsOverview attempt={attempt} />
    </div>
  )
}