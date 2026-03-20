"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Play, Trophy, History, BarChart2 } from "lucide-react"

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 text-slate-300 overflow-hidden">
      <AnimatedBackground />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center gap-12"
      >
        <motion.div variants={item} className="space-y-6">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <span className="relative z-10 bg-[#111827] border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 inline-flex shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Frontend Developer Assignment
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-500 tracking-tighter leading-tight drop-shadow-sm">
            AI-Powered <br className="md:hidden" />Quiz Application
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Developed by <span className="text-white font-bold">M. Nishanth</span> to demonstrate expertise in Next.js 14, TypeScript, complex state management, and modern UI engineering.
          </p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[
            { title: "Generate Quiz", href: "/generate", icon: <Play size={24} />, color: "from-blue-600 to-indigo-600", shadow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]" },
            { title: "Leaderboard", href: "/leaderboard", icon: <Trophy size={24} />, color: "from-yellow-500 to-orange-500", shadow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]" },
            { title: "Your History", href: "/history", icon: <History size={24} />, color: "from-purple-600 to-fuchsia-600", shadow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]" },
            { title: "Analytics", href: "/stats", icon: <BarChart2 size={24} />, color: "from-emerald-500 to-teal-500", shadow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]" },
          ].map((card) => (
            <Link key={card.title} href={card.href} className="group">
              <div className={`bg-[#111827]/80 backdrop-blur-md border border-white/10 p-8 rounded-3xl h-full flex flex-col items-center justify-center gap-4 transition-all duration-300 group-hover:bg-[#1a2035] group-hover:scale-105 group-hover:border-white/20 relative overflow-hidden`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${card.color}`} />
                <div className={`p-4 rounded-2xl bg-gradient-to-br transition-all duration-300 ${card.color} ${card.shadow} text-white group-hover:scale-110`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-white text-lg tracking-wide">{card.title}</h3>
              </div>
            </Link>
          ))}
        </motion.div>

        <motion.div variants={item} className="mt-12 flex flex-col items-center gap-4 bg-[#111827]/50 border border-white/5 p-8 rounded-3xl text-sm text-slate-400 text-left max-w-4xl font-medium shadow-inner">
          <h4 className="text-white font-bold text-base mb-2 self-start tracking-wide uppercase">🚀 Assignment Features Successfully Implemented:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 w-full list-disc pl-5 marker:text-blue-500">
            <li>Dynamic AI Generation via Next.js Proxy Routes</li>
            <li>Advanced Zustand State Management & Persistence</li>
            <li>Complex Fractional Grading (Partial Credits & Penalties)</li>
            <li>Supabase Data Persistence (Global Leaderboards & History)</li>
            <li>4 Unique Formats: MCQ, True/False, Blank, Multi-Select</li>
            <li>Deep Analytics: Difficulty, Type Accuracy & Trend Charts</li>
            <li>Interactive Post-Quiz AI Retutor & Hint Penalties</li>
            <li>100% Scalable Mobile-First Responsive UI</li>
          </ul>
        </motion.div>
      </motion.div>
    </main>
  )
}