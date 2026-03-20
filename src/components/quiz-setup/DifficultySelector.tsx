import * as React from "react"
import { motion } from "framer-motion"

interface DifficultySelectorProps {
  difficulty: "Easy" | "Medium" | "Hard"
  onChange: (diff: "Easy" | "Medium" | "Hard") => void
}

export function DifficultySelector({ difficulty, onChange }: DifficultySelectorProps) {
  const levels = ["Easy", "Medium", "Hard"] as const

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-slate-300">Difficulty Level</label>
      <div className="flex gap-3">
        {levels.map((level) => {
          const isSelected = difficulty === level
          
          let glowClass = "bg-[#1a2035] border-white/10 text-slate-400 hover:bg-[#252f4a] hover:border-white/20"
          if (isSelected) {
            if (level === "Easy") glowClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            if (level === "Medium") glowClass = "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            if (level === "Hard") glowClass = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          }

          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03, translateY: -2 }}
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300 ${glowClass}`}
            >
              <span className="font-bold text-sm tracking-wide uppercase">{level}</span>
              {isSelected && (
                <motion.div layoutId="diff-indicator" className="w-8 h-1 rounded-full mt-2 opacity-50 bg-current" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
