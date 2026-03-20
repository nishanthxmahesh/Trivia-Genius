"use client"
import { useEffect, useState, useMemo } from "react"
import { useQuizStore } from "@/store/quizStore"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Target, ArrowRight, CheckCircle2, XCircle, Trash2, ShieldAlert, Filter, SortAsc, SortDesc, ChevronDown, Trophy, BarChart2, Zap, Award, TrendingUp, PieChart as PieIcon, Download } from "lucide-react"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function HistoryPage() {
  const { history, deleteAttempt, clearHistory, loadHistory, isSyncing } = useQuizStore()
  
  const [filterTopic, setFilterTopic] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  const uniqueTopics = useMemo(() => {
    return ["all", ...new Set(history.map(a => a.topic))]
  }, [history])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const processedHistory = useMemo(() => {
    let list = [...history]

    // Filtering
    if (filterTopic !== "all") {
      list = list.filter(a => a.topic === filterTopic)
    }
    if (filterDifficulty !== "all") {
      list = list.filter(a => a.difficulty === filterDifficulty)
    }

    // Sorting
    list.sort((a, b) => {
      const scoreA = (a.score / a.total) * 100
      const scoreB = (b.score / b.total) * 100
      
      switch (sortBy) {
        case "date-desc": return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "score-desc": return scoreB - scoreA
        case "score-asc": return scoreA - scoreB
        case "time-asc": return a.timeTaken - b.timeTaken
        case "time-desc": return b.timeTaken - a.timeTaken
        default: return 0
      }
    })

    return list
  }, [history, filterTopic, filterDifficulty, sortBy])

  if (isSyncing && history.length === 0) {
    return (
      <main className="min-h-screen text-slate-300 p-4 md:p-8 relative pb-20">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-lg text-blue-400">Loading History...</span>
          </div>
        </div>
      </main>
    )
  }

  if (history.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight text-center">Your Quiz Journey</h1>
        <div className="bg-[#111827] border border-white/10 p-12 rounded-3xl text-center max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <HistoryIcon className="w-16 h-16 text-slate-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">No History Yet</h2>
          <p className="text-slate-400 mb-8 font-medium">You haven't completed any quizzes. Take your first quiz to start tracking your performance!</p>
          <Link href="/generate" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Start a Quiz Now
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen text-slate-300 p-4 md:p-12 relative">
      <AnimatedBackground />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter">Your History</h1>
            <p className="text-slate-400 font-medium text-lg">Review past performances and analyze your growth.</p>
          </div>
          
          <button 
            onClick={() => { if(confirm("Delete ALL quiz history forever? This cannot be undone!")) clearHistory() }}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-red-500/20"
          >
            <ShieldAlert size={18} /> Delete All History
          </button>
        </div>

        {/* Filters & Sorting Controls */}
        <div className="bg-[#111827]/50 border border-white/5 p-4 rounded-2xl mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Filter</span>
          </div>

          <select 
            value={filterTopic} 
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-[#0a0f1e] border border-white/10 text-slate-300 text-sm font-bold px-4 py-2 rounded-xl outline-none focus:border-blue-500/50 min-w-[140px]"
          >
            {uniqueTopics.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All Topics' : t}</option>
            ))}
          </select>

          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-[#0a0f1e] border border-white/10 text-slate-300 text-sm font-bold px-4 py-2 rounded-xl outline-none focus:border-blue-500/50"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <div className="flex-1 min-w-[20px]" />

          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Sort By</span>
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0a0f1e] border border-white/10 text-slate-300 text-sm font-bold px-4 py-2 rounded-xl outline-none focus:border-blue-500/50 min-w-[160px]"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="time-asc">Fastest Time</option>
            <option value="time-desc">Slowest Time</option>
          </select>
        </div>

        <div className="grid gap-6">
          <AnimatePresence>
            {processedHistory.length === 0 ? (
               <div className="text-center py-12 bg-[#111827]/40 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-slate-500 font-medium font-mono uppercase tracking-widest">No results matching your filters</p>
               </div>
            ) : processedHistory.map((attempt, i) => {
              const date = new Date(attempt.date)
              const percentage = Math.max(0, Math.round((attempt.earnedMarks / attempt.totalMarks) * 100))
              const isGood = percentage >= 70
              const isOk = percentage >= 40 && percentage < 70

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                  key={attempt.id}
                  className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between group hover:bg-[#1a2035] transition-colors relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isGood ? 'bg-emerald-500' : isOk ? 'bg-amber-500' : 'bg-red-500'}`} />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-[#0a0f1e] border border-white/5 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-wider">{attempt.topic}</span>
                      <span className={`w-2 h-2 rounded-full ${attempt.difficulty === 'Easy'? 'bg-emerald-500' : attempt.difficulty === 'Medium'? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold text-slate-400">{attempt.difficulty}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight drop-shadow-sm">{percentage}% Score</h3>
                    <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-400">
                      <div className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /> {attempt.score}/{attempt.total} Correct</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {attempt.earnedMarks} Marks</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> {attempt.timeTaken}s Total</div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-400" /> {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <button 
                      onClick={() => { if(confirm("Delete this quiz?")) deleteAttempt(attempt.id) }} 
                      className="w-full sm:w-auto p-4 rounded-xl border border-white/10 bg-[#0a0f1e] text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 size={20} />
                    </button>
                    <Link
                      href={`/results/${attempt.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow"
                    >
                      Detailed Review <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

function HistoryIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}