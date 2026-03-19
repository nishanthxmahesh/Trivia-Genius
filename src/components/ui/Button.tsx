"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300",
      secondary: "bg-gray-800 text-gray-100 hover:bg-gray-700",
      ghost: "hover:bg-gray-800 hover:text-gray-100 text-gray-400",
      link: "text-blue-500 underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-12 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-14 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <motion.button
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button }
