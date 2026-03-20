"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1e] disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/20",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
      outline: "border border-white/10 bg-transparent hover:bg-white/5 text-slate-300",
      secondary: "bg-[#1a2035] text-white hover:bg-[#252f4a] border border-white/5",
      ghost: "hover:bg-white/5 hover:text-white text-slate-400",
      link: "text-blue-500 underline-offset-4 hover:underline",
    }
    const sizes = {
      default: "h-12 px-6 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-14 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <motion.button
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02, translateY: disabled || isLoading ? 0 : -1 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"
