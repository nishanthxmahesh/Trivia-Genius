"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function ExplanationButton({
  question, correctAnswer, userAnswer, topic,
}: {
  question: string; correctAnswer: string; userAnswer: string; topic: string
}) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getExplanation = async () => {
    if (explanation) { setExplanation(null); return }
    setLoading(true)
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, correctAnswer, userAnswer, topic }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setExplanation(data.explanation)
    } catch {
      setExplanation("Could not load explanation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={getExplanation}
        disabled={loading}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-40 font-semibold"
      >
        {loading ? "Loading..." : explanation ? "Hide explanation" : "📖 Explain this answer"}
      </button>
      {explanation && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs rounded-xl px-4 py-3 leading-relaxed"
        >
          {explanation}
        </motion.div>
      )}
    </div>
  )
}
