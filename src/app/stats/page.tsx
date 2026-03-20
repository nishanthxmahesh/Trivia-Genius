"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { motion } from "framer-motion"
import { Trophy, Clock, Target, Calendar, BarChart2, Zap, Award, TrendingUp, PieChart as PieIcon, Download } from "lucide-react"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts'
import { format, differenceInDays, isSameDay, subDays } from 'date-fns'

export default function StatsPage() {
  const router = useRouter()
  const { history, loadHistory, isSyncing } = useQuizStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { 
    setMounted(true)
    loadHistory() 
  }, [loadHistory])

  // Performance Trend Data
  const trendData = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(a => ({
        date: format(new Date(a.date), 'MMM dd'),
        score: Math.round((a.earnedMarks / a.totalMarks) * 100),
        topic: a.topic
      }))
  }, [history])

  // Streak Calculation
  const streak = useMemo(() => {
    if (history.length === 0) return 0
    const dates = [...new Set(history.map(a => format(new Date(a.date), 'yyyy-MM-dd')))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    let currentStreak = 0
    let today = new Date()
    let checkDate = format(today, 'yyyy-MM-dd')

    // If no quiz today, check if there was one yesterday to continue streak
    if (!dates.includes(checkDate)) {
      checkDate = format(subDays(today, 1), 'yyyy-MM-dd')
      if (!dates.includes(checkDate)) return 0
    }

    for (const d of dates) {
      if (d === checkDate) {
        currentStreak++
        checkDate = format(subDays(new Date(checkDate), 1), 'yyyy-MM-dd')
      } else {
        break
      }
    }
    return currentStreak
  }, [history])

  // Topic-wise Map for multiple uses
  const topicMap = useMemo(() => {
    const map: Record<string, { score: number; total: number; count: number }> = {}
    history.forEach((a) => {
      const t = a.topic
      if (!map[t]) map[t] = { score: 0, total: 0, count: 0 }
      map[t].score += Math.max(0, a.earnedMarks)
      map[t].total += a.totalMarks
      map[t].count += 1
    })
    return map
  }, [history])

  // Category-wise Data for Chart
  const categoryData = useMemo(() => {
    return Object.entries(topicMap).map(([name, d]) => ({
      name,
      percentage: Math.round((d.score / d.total) * 100),
      count: d.count
    })).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [topicMap])

  // Achievements
  const achievements = useMemo(() => {
    const list = []
    if (history.length >= 1) list.push({ id: 'first', title: 'First Steps', desc: 'Completed your first quiz', icon: <Zap className="text-yellow-400" /> })
    if (history.some(a => (a.earnedMarks / a.totalMarks) >= 1)) list.push({ id: 'perfect', title: 'Perfectionist', desc: 'Got 100% on a quiz', icon: <Trophy className="text-blue-400" /> })
    if (history.some(a => a.timeTaken < 30)) list.push({ id: 'speed', title: 'Speed Demon', desc: 'Completed a quiz in < 30s', icon: <Zap className="text-purple-400" /> })
    if (streak >= 3) list.push({ id: 'dedicated', title: 'Dedicated Learner', desc: '3+ day streak', icon: <Award className="text-emerald-400" /> })
    if (history.length >= 10) list.push({ id: 'veteran', title: 'Quiz Veteran', desc: 'Completed 10 quizzes', icon: <Target className="text-orange-400" /> })
    
    const sameTopicCount = Object.values(topicMap).map(v => v.count)
    if (Math.max(...(sameTopicCount.length ? sameTopicCount : [0])) >= 5) {
      list.push({ id: 'expert', title: 'Topic Expert', desc: '5 quizzes in one topic', icon: <Award className="text-indigo-400" /> })
    }

    return list
  }, [history, streak, topicMap])

  const totalQuizzes = history.length
  const totalQuestions = history.reduce((acc, a) => acc + a.total, 0)
  const totalCorrect = history.reduce((acc, a) => acc + a.score, 0)
  const avgScore = totalQuizzes === 0 ? 0 : Math.round(
    history.reduce((acc, a) => acc + Math.max(0, (a.earnedMarks / a.totalMarks) * 100), 0) / totalQuizzes
  )
  const bestScore = totalQuizzes === 0 ? 0 : Math.max(...history.map((a) => Math.round(Math.max(0, (a.earnedMarks / a.totalMarks) * 100))))
  const totalTimeSecs = history.reduce((acc, a) => acc + a.timeTaken, 0)
  const totalMins = Math.floor(totalTimeSecs / 60)

  const topicStats = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    percentage: Math.round((data.score / data.total) * 100),
    count: data.count,
  }))

  const bestTopic = [...topicStats].sort((a, b) => b.percentage - a.percentage)[0]
  const mostPlayed = [...topicStats].sort((a, b) => b.count - a.count)[0]

  const difficultyMap: Record<string, { score: number; total: number; count: number }> = {
    Easy: { score: 0, total: 0, count: 0 },
    Medium: { score: 0, total: 0, count: 0 },
    Hard: { score: 0, total: 0, count: 0 },
  }
  history.forEach((a) => {
    if (difficultyMap[a.difficulty]) {
      difficultyMap[a.difficulty].score += Math.max(0, a.earnedMarks)
      difficultyMap[a.difficulty].total += a.totalMarks
      difficultyMap[a.difficulty].count += 1
    }
  })

  const recentFive = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .reverse()

  let totalHintsUsed = 0;
  const typeMap: Record<string, { correct: number; total: number }> = {
    mcq: { correct: 0, total: 0 },
    truefalse: { correct: 0, total: 0 },
    fillintheblank: { correct: 0, total: 0 },
    multiselect: { correct: 0, total: 0 },
  }
  
  history.forEach((a) => {
    a.questions.forEach((q) => {
      const uAnsStr = a.userAnswers[q.id] || ""
      if (uAnsStr !== "") {
        const type = q.type || 'mcq'
        if (!typeMap[type]) typeMap[type] = { correct: 0, total: 0 }
        typeMap[type].total += 1
        
        let isCorrect = false
        if (type === 'multiselect') {
           try{
             const cArr = JSON.parse(q.correctAnswer)
             const uArr = JSON.parse(uAnsStr)
             const correctPicks = uArr.filter((u:string) => cArr.includes(u)).length
             const wrongPicks = uArr.filter((u:string) => !cArr.includes(u)).length
             if (wrongPicks === 0 && correctPicks === cArr.length) isCorrect = true
           }catch(e){}
        } else if (type === 'fillintheblank') {
           isCorrect = uAnsStr.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        } else {
           isCorrect = uAnsStr === q.correctAnswer
        }
        if (isCorrect) typeMap[type].correct += 1
      }
      totalHintsUsed += a.questionHints?.[q.id]?.hintsUsed || 0
    })
  })

  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSecs / totalQuestions) : 0

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-emerald-400"
    if (pct >= 50) return "text-amber-400"
    return "text-red-400"
  }

  const getBarColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
    if (pct >= 50) return "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
    return "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
  }

  if (!mounted) return null

  if (isSyncing && history.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-8 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-lg text-blue-400">Loading Stats...</span>
        </div>
      </main>
    )
  }

  if (totalQuizzes === 0) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-8 flex flex-col items-center justify-center">
        <BarChart2 className="w-16 h-16 text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">No Stats Available</h2>
        <p className="text-slate-400 mb-8 max-w-sm text-center">Complete a quiz to unlock detailed performance analytics.</p>
        <button onClick={() => router.push("/generate")} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          Generate a Quiz
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen text-slate-300 p-4 md:p-8 relative pb-20">
      <AnimatedBackground />
      <div className="max-w-5xl mx-auto relative z-10 space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Your Analytics</h1>
            <p className="text-slate-400 font-medium">Detailed breakdown of your learning journey.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex items-center gap-4 px-6 shadow-xl">
               <Zap className={`w-8 h-8 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} />
               <div>
                  <p className="text-2xl font-black text-white">{streak}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Day Streak</p>
               </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-8">
           {/* Performance Trends */}
           <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden min-h-[400px]">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-blue-400 w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Performance Trend</h2>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#111827' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Category Analysis */}
           <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden min-h-[400px]">
              <div className="flex items-center gap-3 mb-6">
                <PieIcon className="text-emerald-400 w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Category Accuracy</h2>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#ffffff" 
                      fontSize={11} 
                      width={100}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      cursor={{fill: '#ffffff05'}}
                    />
                    <Bar dataKey="percentage" radius={[0, 10, 10, 0]} barSize={20}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.percentage > 80 ? '#10b981' : entry.percentage > 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
            <Award className="text-purple-400 w-6 h-6" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Success Achievements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((ach) => (
              <motion.div 
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 bg-[#0a0f1e] p-5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all hover:bg-blue-500/5"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {ach.icon}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{ach.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{ach.desc}</p>
                </div>
              </motion.div>
            ))}
            {achievements.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">Complete more quizzes to unlock achievements!</p>}
          </div>
        </div>

        {/* Previous Grid of Stats */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Core Metrics</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: totalQuizzes, label: "Quizzes", icon: <Trophy className="w-4 h-4 text-blue-400"/> },
              { value: `${avgScore}%`, label: "Avg Score", color: getScoreColor(avgScore), icon: <Target className="w-4 h-4 text-emerald-400"/> },
              { value: streak, label: "Streak", color: "text-orange-400", icon: <Zap className="w-4 h-4 text-orange-400"/> },
              { value: `${totalMins}m`, label: "Total Time", icon: <Clock className="w-4 h-4 text-amber-400"/> },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 justify-center opacity-80">{stat.icon}</div>
                <p className={`text-2xl md:text-3xl font-black font-mono mb-1 ${stat.color || "text-white"}`}>{stat.value}</p>
                <p className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Difficulty Breakdown */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Difficulty Accuracy</h2>
            <div className="flex flex-col gap-5">
              {Object.entries(difficultyMap).map(([diff, data]) => {
                if (data.count === 0) return null
                const pct = Math.round((data.score / data.total) * 100)
                return (
                  <div key={diff}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${diff==="Easy"?"text-emerald-400":diff==="Medium"?"text-amber-400":"text-red-400"}`}>{diff}</span>
                        <span className="text-xs text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded-md">{data.count} played</span>
                      </div>
                      <span className={`text-sm font-black font-mono ${getScoreColor(pct)}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-[#0a0f1e] rounded-full h-3 border border-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${getBarColor(pct)}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Type Accuracy */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Format Accuracy</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(typeMap).map(([type, data]) => {
                if (data.total === 0) return null
                const pct = Math.round((data.correct / data.total) * 100)
                const label = type === 'mcq' ? "Multiple Choice" : type === 'truefalse' ? "True/False" : type === 'multiselect' ? "Multi-Correct" : "Fill in Blank"
                return (
                  <div key={type} className="bg-[#0a0f1e] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-white/10 transition-colors">
                    <span className={`text-2xl font-black font-mono mb-1 relative z-10 ${getScoreColor(pct)}`}>{pct}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider relative z-10">{label}</span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${getBarColor(pct)}`} transition={{ duration: 1 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}