"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number // 0 to 100
  colorClass?: string
}

export function ProgressBar({ progress, colorClass = "bg-blue-500", className, ...props }: ProgressBarProps) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-gray-800 h-2", className)}
      {...props}
    >
      <motion.div
        className={cn("h-full rounded-full", colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
    </div>
  )
}
