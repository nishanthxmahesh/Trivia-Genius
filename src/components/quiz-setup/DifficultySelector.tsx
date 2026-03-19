import * as React from "react"
import { cn } from "@/lib/utils"

interface DifficultySelectorProps {
  difficulty: "Easy" | "Medium" | "Hard"
  onChange: (diff: "Easy" | "Medium" | "Hard") => void
}

export function DifficultySelector({ difficulty, onChange }: DifficultySelectorProps) {
  const levels = ["Easy", "Medium", "Hard"] as const

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-gray-300">Difficulty Level</label>
      <div className="flex gap-2">
        {levels.map((level) => {
          const isSelected = difficulty === level
          
          let colorClass = ""
          if (isSelected) {
            colorClass = level === "Easy" 
              ? "bg-green-500/20 text-green-400 border-green-500/50" 
              : level === "Medium" 
                 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                 : "bg-red-500/20 text-red-400 border-red-500/50"
          } else {
            colorClass = "bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700"
          }

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                "flex-1 rounded-xl border py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
                colorClass
              )}
            >
              {level}
            </button>
          )
        })}
      </div>
    </div>
  )
}
