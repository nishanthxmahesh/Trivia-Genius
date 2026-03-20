import * as React from "react"
import { motion } from "framer-motion"
import { QuestionType } from "@/types/quiz"
import { cn } from "@/lib/utils"

interface QuestionTypeSelectorProps {
  selectedTypes: QuestionType[]
  onToggle: (type: QuestionType) => void
}

export function QuestionTypeSelector({ selectedTypes, onToggle }: QuestionTypeSelectorProps) {
  const QUESTION_TYPES: { value: QuestionType; label: string; desc: string }[] = [
    { value: "mcq", label: "Multiple Choice", desc: "Four options, one correct answer" },
    { value: "multiselect", label: "Multiple Correct", desc: "More than one option can be right" },
    { value: "truefalse", label: "True / False", desc: "Binary choices" },
    { value: "fillintheblank", label: "Fill in Blank", desc: "Type the exact answer" },
  ]

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-slate-300">Question Types</label>
      <div className="grid gap-3 sm:grid-cols-3">
        {QUESTION_TYPES.map((t) => {
          const isSelected = selectedTypes.includes(t.value)
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              key={t.value}
              type="button"
              onClick={() => onToggle(t.value)}
              className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  : "bg-[#1a2035] border-white/10 text-slate-400 hover:bg-[#252f4a] hover:border-white/20"
              }`}
            >
              <div className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                isSelected ? "border-transparent bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]" : "border-slate-600 bg-[#0a0f1e]"
              }`}>
                {isSelected && (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <span className={cn("font-bold", isSelected ? "text-white" : "text-slate-300")}>
                  {t.label}
                </span>
                <p className={`text-xs ${isSelected ? "text-blue-200" : "text-slate-500"}`}>
                  {t.desc}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
