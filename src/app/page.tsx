"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Play, Trophy, History, BarChart2, ShieldCheck, Zap, Sparkles, Cpu, Globe, Database, Smartphone, Star } from "lucide-react"

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
            Developed by <span className="text-white font-bold">M. Nishanth</span> to demonstrate expertise in Next.js 16, TypeScript, complex state management, and modern UI engineering.
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

        <motion.div variants={item} className="w-full space-y-8">
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-white/60 font-bold text-xs uppercase tracking-[0.3em]">Built with Modern Ecosystem</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: "Next.js 16", color: "bg-white/5 border-white/10 text-white" },
                { name: "TypeScript", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
                { name: "Tailwind CSS", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
                { name: "Supabase", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                { name: "Zustand", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                { name: "Framer Motion", color: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400" },
                { name: "Groq AI", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
              ].map((tech) => (
                <span key={tech.name} className={`px-4 py-2 rounded-xl border text-xs font-black tracking-tight ${tech.color}`}>
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-3xl group hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <h4 className="text-white font-bold mb-2">Smart Generation</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">Gen AI models generate unique, challenging, and factually accurate questions instantly.</p>
            </div>
            
            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-3xl group hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Database size={20} />
              </div>
              <h4 className="text-white font-bold mb-2">Cloud Persistence</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">Supabase integration for secure, real-time data storage, global leaderboards, and persistent history.</p>
            </div>

            <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-3xl group hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Smartphone size={20} />
              </div>
              <h4 className="text-white font-bold mb-2">PWA Ready</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">Installable web experience with offline support, manifests, and optimized service workers for mobile.</p>
            </div>
          </div>

          <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] text-left shadow-2xl relative overflow-hidden group">
            <h4 className="text-white font-black text-2xl mb-8 flex items-center gap-3 tracking-tight">
              <ShieldCheck className="text-blue-500" /> 
              Assignment Implementation Success
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full">
              <div className="space-y-4">
                <h5 className="text-blue-400 font-black text-xs uppercase tracking-widest">Mandatory Features</h5>
                <ul className="space-y-3">
                  {[
                    "AI-Powered Dynamic Quiz Generation",
                    "Zustand State Persistence & Auto-Save",
                    "Comprehensive Results & Growth Analytics",
                    "Supabase Cloud Persistence (History/Leaderboard)",
                    "100% Responsive & Mobile-First Engineering",
                    "Intelligent Error & Rate-Limit Handling"
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h5 className="text-emerald-400 font-black text-xs uppercase tracking-widest">Bonus Features (Advanced)</h5>
                <ul className="space-y-3">
                  {[
                    "AI Retutor Interface & Hint Penalties",
                    "4 Question Formats (MCQ, T/F, Fill, Multi)",
                    "Performance Charts & Category Analytics",
                    "PDF Export Functionality (Results)",
                    "PWA & Offline Installation Support",
                    "Timed Global Challenges & Podium System"
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}