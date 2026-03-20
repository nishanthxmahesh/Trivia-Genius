import * as React from "react"
import { motion } from "framer-motion"

interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full h-3 bg-[#111827] rounded-full overflow-hidden border border-white/5 shadow-inner ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </div>
  )
}
