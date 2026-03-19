import * as React from "react"
import { QuestionType } from "@/types/quiz"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface QuestionTypeSelectorProps {
  selectedTypes: QuestionType[]
  onToggle: (type: QuestionType) => void
}

const QUESTION_TYPES: { value: QuestionType; label: string; desc: string }[] = [
  { value: "mcq", label: "Multiple Choice", desc: "4 options to choose from" },
  { value: "truefalse", label: "True / False", desc: "Is it true or false?" },
  { value: "fillintheblank", label: "Fill in the Blank", desc: "Complete the sentence" },
]

export function QuestionTypeSelector({ selectedTypes, onToggle }: QuestionTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-gray-300">Question Types</label>
      <div className="grid gap-3 sm:grid-cols-1">
        {QUESTION_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.value)
          return (
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              key={type.value}
              onClick={() => onToggle(type.value)}
              className={cn(
                "relative flex items-center justify-between overflow-hidden rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
                isSelected 
                  ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "border-gray-800 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700"
              )}
            >
              <div className="relative z-10 flex flex-col gap-1">
                <span className={cn("font-medium", isSelected ? "text-blue-200" : "text-gray-200")}>
                  {type.label}
                </span>
                <span className="text-xs text-gray-400">
                  {type.desc}
                </span>
              </div>
              
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-1">Select one or more. Questions will be mixed evenly.</p>
    </div>
  )
}
