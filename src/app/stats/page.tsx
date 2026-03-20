"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuizStore } from "@/store/quizStore"
import { motion } from "framer-motion"
import { Trophy, Clock, Target, Calendar, BarChart2 } from "lucide-react"

export default function StatsPage() {
  const router = useRouter()
  const { history, loadHistory, isSyncing } = useQuizStore()

  useEffect(() => { loadHistory() }, [loadHistory])

  const totalQuizzes = history.length
  const totalQuestions = history.reduce((acc, a) => acc + a.total, 0)
  const totalCorrect = history.reduce((acc, a) => acc + a.score, 0)
  const avgScore = totalQuizzes === 0 ? 0 : Math.round(
    history.reduce((acc, a) => acc + Math.max(0, (a.earnedMarks / a.totalMarks) * 100), 0) / totalQuizzes
  )
  const bestScore = totalQuizzes === 0 ? 0 : Math.max(...history.map((a) => Math.round(Math.max(0, (a.earnedMarks / a.totalMarks) * 100))))
  const totalTimeSecs = history.reduce((acc, a) => acc + a.timeTaken, 0)
  const totalMins = Math.floor(totalTimeSecs / 60)

  const topicMap: Record<string, { score: number; total: number; count: number }> = {}
  history.forEach((a) => {
    const t = a.topic.toLowerCase()
    if (!topicMap[t]) topicMap[t] = { score: 0, total: 0, count: 0 }
    topicMap[t].score += Math.max(0, a.earnedMarks)
    topicMap[t].total += a.totalMarks
    topicMap[t].count += 1
  })

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
    <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Your Analytics</h1>
            <p className="text-slate-400 font-medium">Detailed breakdown of your learning journey.</p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Overall Performance</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { value: totalQuizzes, label: "Quizzes Taken", icon: <Trophy className="w-4 h-4 text-blue-400"/> },
              { value: `${avgScore}%`, label: "Average Score", color: getScoreColor(avgScore), icon: <Target className="w-4 h-4 text-emerald-400"/> },
              { value: `${bestScore}%`, label: "Best Score", color: "text-purple-400", icon: <Trophy className="w-4 h-4 text-purple-400"/> },
              { value: `${totalMins}m`, label: "Total Time", icon: <Clock className="w-4 h-4 text-amber-400"/> },
              { value: totalQuestions, label: "Questions Answered", icon: <BarChart2 className="w-4 h-4 text-indigo-400"/> },
              { value: totalCorrect, label: "Correct Answers", color: "text-emerald-400", icon: <Target className="w-4 h-4 text-emerald-400"/> },
              { value: totalHintsUsed, label: "Total Hints Used", color: "text-amber-500", icon: <Clock className="w-4 h-4 text-amber-500"/> },
              { value: `${avgTimePerQuestion}s`, label: "Avg Time / Question", color: "text-blue-500", icon: <Clock className="w-4 h-4 text-blue-500"/> },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <div className="flex items-center gap-2 mb-2 justify-center opacity-80">
                  {stat.icon}
                </div>
                <p className={`text-2xl md:text-4xl font-black font-mono mb-1 ${stat.color || "text-white"}`}>{stat.value}</p>
                <p className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Highlights */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Highlights</h2>
            <div className="flex flex-col gap-4">
              {bestTopic && (
                <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-5 flex justify-between items-center group hover:border-white/10 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Best Topic</p>
                    <p className="font-bold text-white capitalize text-lg">{bestTopic.topic}</p>
                  </div>
                  <p className={`text-3xl font-black font-mono ${getScoreColor(bestTopic.percentage)}`}>{bestTopic.percentage}%</p>
                </div>
              )}
              {mostPlayed && (
                <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-5 flex justify-between items-center group hover:border-white/10 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Most Played Topic</p>
                    <p className="font-bold text-white capitalize text-lg">{mostPlayed.topic}</p>
                  </div>
                  <p className="text-3xl font-black font-mono text-blue-500">{mostPlayed.count}x</p>
                </div>
              )}
            </div>
          </div>

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

        {/* Recent Trend */}
        {recentFive.length > 1 && (
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
              Recent Trend (last {recentFive.length})
            </h2>
            <div className="flex items-end gap-3 h-40">
              {recentFive.map((a, i) => {
                const pct = Math.round(Math.max(0, (a.earnedMarks / a.totalMarks) * 100))
                return (
                  <div key={a.id} className="flex-1 flex flex-col items-center gap-2 relative group">
                    <span className={`text-sm font-black font-mono transition-transform group-hover:-translate-y-1 ${getScoreColor(pct)}`}>{pct}%</span>
                    <div className="w-full flex items-end h-[100px] bg-[#0a0f1e] rounded-xl overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${Math.max(pct, 5)}%` }} transition={{ duration: 1, delay: i*0.1 }}
                        className={`w-full rounded-t-lg ${getBarColor(pct)}`}
                      />
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest text-center truncate w-full px-1">{a.topic}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}