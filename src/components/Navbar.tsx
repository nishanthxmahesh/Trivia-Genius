"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { motion, AnimatePresence } from "framer-motion"
import { Home, History, Trophy, BarChart2, PlayCircle, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"

export default function Navbar() {
  const pathname = usePathname()
  const activeQuiz = useQuizStore((state) => state.questions.length > 0)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const [expanded, setExpanded] = useState(false)



  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setExpanded(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navItems = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    { label: "Generate Quiz", href: "/generate", icon: <PlayCircle size={20} /> },
    { label: "History", href: "/history", icon: <History size={20} /> },
    { label: "Leaderboard", href: "/leaderboard", icon: <Trophy size={20} /> },
    { label: "Stats", href: "/stats", icon: <BarChart2 size={20} /> },
  ]

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <TooltipProvider>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-sm">
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around p-2 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="relative p-3 flex flex-col items-center gap-1 group">
                <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-blue-600/20 text-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                {isActive && (
                  <motion.div layoutId="nav-glow-mobile" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <motion.nav
        initial={false}
        animate={{ width: expanded ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex h-screen bg-[#111827] border-r border-white/10 flex-col p-4 sticky top-0 z-50 overflow-hidden shrink-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between mb-8 overflow-hidden pl-2 mt-4">
          <AnimatePresence mode="wait">
            {expanded && (
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="title">
                 <span className="font-black text-xl tracking-tighter text-blue-400 whitespace-nowrap">Trivia Genius</span>
               </motion.div>
            )}
          </AnimatePresence>
          <button className="text-slate-400 hover:text-white transition-colors p-1" onClick={() => setExpanded(!expanded)}>
            {expanded ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex relative items-center group">
                {isActive && (
                  <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                <motion.div
                  className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${isActive ? "bg-blue-500/10 text-blue-400 font-bold" : "text-slate-400 hover:bg-[#1a2035] hover:text-slate-200"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <AnimatePresence mode="wait">
                    {expanded && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate" key="label">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </div>

        {activeQuiz && (
          <Link href="/quiz" className="mt-auto group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center gap-4 p-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.2)]"
            >
              <div className="relative shrink-0">
                <PlayCircle size={20} className="relative z-10" />
                <span className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-30"></span>
              </div>
              <AnimatePresence mode="wait">
                {expanded && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold whitespace-nowrap truncate shrink-0" key="resume">
                    Resume Quiz
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        )}
      </motion.nav>
    </TooltipProvider>
  )
}