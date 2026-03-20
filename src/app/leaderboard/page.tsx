"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Search, Star, Medal, ArrowUp, Clock } from "lucide-react"

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [difficultyMap, setDifficultyMap] = useState("All")

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data: records, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('percentage', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(100)
      
      if (!error && records) {
        setData(records)
      }
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const ms = d.username.toLowerCase().includes(search.toLowerCase()) || d.topic.toLowerCase().includes(search.toLowerCase())
      const md = difficultyMap === "All" || d.difficulty === difficultyMap
      return ms && md
    })
  }, [data, search, difficultyMap])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0f1e]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
    </div>
  )

  const top3 = filteredData.slice(0, 3)
  const reorderedTop3 = [top3[1], top3[0], top3[2]].filter(Boolean) // 2nd, 1st, 3rd

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-4 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tighter mb-2">Hall of Fame</h1>
            <p className="text-slate-400 font-medium">Top quiz performances across all topics.</p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search players or topics..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-72 bg-[#111827]/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600 transition-all font-medium text-white shadow-inner"
              />
            </div>
            <div className="flex gap-2 p-1 bg-[#111827]/80 border border-white/10 rounded-xl relative">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyMap(diff)}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg relative z-10 transition-colors ${difficultyMap === diff ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  {difficultyMap === diff && (
                    <motion.div layoutId="diff-tab" className="absolute inset-0 bg-blue-600 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] -z-10" />
                  )}
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </header>

        {reorderedTop3.length > 0 && (
          <div className="flex items-end justify-center h-80 gap-4 md:gap-8 mb-16 px-4">
            {reorderedTop3.map((entry, idx) => {
              const place = entry === top3[0] ? 1 : entry === top3[1] ? 2 : 3
              const height = place === 1 ? '100%' : place === 2 ? '80%' : '65%'
              const color = place === 1 ? 'from-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : place === 2 ? 'from-slate-300 to-slate-500 shadow-[0_0_30px_rgba(148,163,184,0.3)]' : 'from-orange-400 to-orange-700 shadow-[0_0_30px_rgba(251,146,60,0.3)]'
              const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * place, type: "spring" }}
                  key={entry.id + place}
                  style={{ height }}
                  className="w-full max-w-[140px] flex flex-col items-center justify-end relative"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + 0.1 * place }} className="text-4xl mb-3 drop-shadow-xl z-20">{medal}</motion.div>
                  <div className={`w-full h-full bg-gradient-to-t ${color} rounded-t-3xl relative flex flex-col items-center justify-center p-4 border border-white/20 z-10 overflow-hidden`}>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:10px_10px] mix-blend-overlay"></div>
                    <span className="text-2xl font-black text-white/90 drop-shadow-md mb-1">{place}</span>
                    <span className="font-bold text-white text-[10px] md:text-xs text-center uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md leading-tight break-all max-w-[120px]">{entry.username}</span>
                    <span className="font-mono font-black text-white text-lg md:text-xl mt-1 drop-shadow-lg">{entry.percentage}%</span>
                    <div className="mt-2 flex flex-col items-center gap-0.5 opacity-90">
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-widest truncate max-w-[110px]">{entry.topic}</span>
                      <span className="text-[10px] font-mono font-bold text-white/70 flex items-center gap-1">
                        <Clock size={10} /> {entry.time_taken}s
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-4 md:px-8 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-slate-500 bg-[#1a2035]/50">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4 md:col-span-3">Player</div>
            <div className="col-span-4 md:col-span-4 hidden md:block">Topic</div>
            <div className="col-span-3 md:col-span-2 text-right">Score</div>
            <div className="col-span-4 md:col-span-2 text-right">Time</div>
          </div>

          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredData.map((entry, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }}
                  key={entry.id}
                  className={`grid grid-cols-12 gap-4 p-4 md:px-8 items-center hover:bg-[#1a2035]/50 transition-colors group ${i < 3 ? 'bg-blue-600/5' : ''}`}
                >
                  <div className="col-span-1 text-center font-black text-slate-600 group-hover:text-blue-400 transition-colors">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div className="col-span-4 md:col-span-3 font-bold text-white truncate text-sm md:text-base">{entry.username}</div>
                  <div className="col-span-4 md:col-span-4 hidden md:flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#0a0f1e] rounded-md text-xs font-bold text-slate-400 border border-white/5 truncate max-w-xs uppercase tracking-wider">{entry.topic}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${entry.difficulty === 'Easy' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : entry.difficulty === 'Medium' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right font-mono text-emerald-400 font-bold text-lg">{entry.percentage}%</div>
                  <div className="col-span-4 md:col-span-2 text-right font-mono text-slate-400 font-medium text-sm">{entry.time_taken}s</div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredData.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-bold">No results found.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}