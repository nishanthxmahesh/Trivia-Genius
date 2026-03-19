import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-500/20 text-blue-400 border-transparent",
    secondary: "bg-gray-800 text-gray-300 border-transparent",
    destructive: "bg-red-500/20 text-red-400 border-transparent",
    success: "bg-green-500/20 text-green-400 border-transparent",
    warning: "bg-yellow-500/20 text-yellow-400 border-transparent",
    outline: "text-gray-300 border-gray-700",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
