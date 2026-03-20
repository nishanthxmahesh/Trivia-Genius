import { QuizAttempt } from "@/types/quiz"
import { Badge } from "@/components/ui/Badge"
import { ExplanationButton } from "./ExplanationButton"
import { AIRetutorChat } from "./AIRetutorChat"
import { useQuizStore } from "@/store/quizStore"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"
import { BrainCircuit, Clock, Target, Calendar } from "lucide-react"

import { useRouter } from "next/navigation"
import { Download, FileText, Share2 } from "lucide-react"
import jsPDF from "jspdf"
import { toPng } from "html-to-image"

export function ResultsOverview({ attempt, onRetake }: { attempt: QuizAttempt, onRetake?: () => void }): JSX.Element {
  const router = useRouter()
  const { setConfig, setQuestions, setCurrentIndex, userAnswers, resetQuiz } = useQuizStore()
  const percentage = Math.max(0, Math.round((attempt.earnedMarks / attempt.totalMarks) * 100))
  
  const [animatedScore, setAnimatedScore] = useState(0)
  const [reviewCount, setReviewCount] = useState(10)
  const [weakAreas, setWeakAreas] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  useEffect(() => {
    if (percentage >= 80) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)
        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } })
      }, 250)
      return () => clearInterval(interval)
    }
  }, [percentage])

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setAnimatedScore(Math.floor(progress * percentage));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [percentage]);

  const analyzeWeakAreas = async () => {
    setAnalyzing(true)
    const wrongs = attempt.questions.filter((q) => {
      const u = attempt.userAnswers[q.id]
      if (q.type === 'multiselect') {
        try {
           const cArr = JSON.parse(q.correctAnswer) as string[]
           const uArr = JSON.parse(u || "[]") as string[]
           if(uArr.length !== cArr.length || uArr.some( (x:string) => !cArr.includes(x))) return true
        } catch(e) {}
      }
      return q.type === "fillintheblank" ? u?.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() : u !== q.correctAnswer
    }).map(q => ({ question: q.text, correctAnswer: q.correctAnswer, userAnswer: attempt.userAnswers[q.id] || "Skipped" }))

    try {
      const res = await fetch("/api/analyze", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: attempt.topic, wrongQuestions: wrongs }) 
      })
      if (!res.ok) {
        setWeakAreas("The AI Analyzer is currently resting or busy (Rate Limit). Please try again later!")
        return
      }
      const data = await res.json()
      setWeakAreas(data.summary)
    } catch(err) {
      setWeakAreas("Failed to analyze. Check your connection or API keys.")
    } finally { setAnalyzing(false) }
  }

  const handleRetake = (onlyWrong: boolean) => {
    let targetQuestions = onlyWrong ? attempt.questions.filter((q) => {
      const uAns = attempt.userAnswers[q.id] || ""
      if (q.type === 'multiselect') {
        try {
          const cArr = JSON.parse(q.correctAnswer)
          const uArr = JSON.parse(uAns || "[]")
          const correctPicks = uArr.filter((u:string) => cArr.includes(u)).length
          const wrongPicks = uArr.filter((u:string) => !cArr.includes(u)).length
          return wrongPicks > 0 || correctPicks < cArr.length
        } catch(e) { return true }
      } else if (q.type === "fillintheblank") {
        return uAns.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase()
      }
      return uAns !== q.correctAnswer
    }) : attempt.questions

    if (targetQuestions.length === 0) {
      targetQuestions = attempt.questions
    }

    setQuestions(targetQuestions)
    setConfig({
      topic: attempt.topic,
      difficulty: attempt.difficulty as any,
      questionCount: targetQuestions.length,
      timerEnabled: attempt.timerEnabled,
      timerSeconds: attempt.timerSeconds,
      hintsEnabled: attempt.hintsEnabled,
      aiChatEnabled: attempt.aiChatEnabled,
      requireAllAnswers: attempt.requireAllAnswers,
      minTimeLimit: attempt.minTimeLimit,
      negativeMarking: attempt.negativeMarking || 0,
      totalMarks: attempt.totalMarks,
      username: attempt.username || "Anonymous",
      questionTypes: attempt.questionTypes,
    })
    
    if (onRetake) {
      onRetake()
    } else {
      window.location.href = "/quiz"
    }
  }

  const exportToPDF = async () => {
    setExporting(true)
    const element = document.getElementById("quiz-results-content")
    if (!element) return

    try {
      // Temporarily set height/width to scrollHeight to ensure full capture
      const originalHeight = element.style.height
      const originalWidth = element.style.width
      const { scrollHeight, scrollWidth } = element
      
      const dataUrl = await toPng(element, {
        quality: 1,
        backgroundColor: "#0a0f1e",
        width: scrollWidth,
        height: scrollHeight,
        style: {
          height: scrollHeight + "px",
          width: scrollWidth + "px"
        },
        filter: (node: any) => {
          if (node.classList) return !node.classList.contains("no-print")
          return true
        }
      })
      
      const imgProps = new Image()
      imgProps.src = dataUrl
      await new Promise(resolve => imgProps.onload = resolve)

      const pdf = new jsPDF("p", "mm", [scrollWidth * 0.264583, scrollHeight * 0.264583]) // 1px = 0.264583mm
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`quiz-result-${attempt.topic}-${new Date().toLocaleDateString()}.pdf`)
    } catch (error) {
      console.error("PDF Export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: "spring" }}
      className="max-w-4xl mx-auto p-4 py-8 relative z-10"
      id="quiz-results-content"
    >
      <div className="bg-[#111827] border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center mb-8 flex flex-col items-center">
        
        <div className="absolute top-8 right-8 flex gap-2 no-print">
          <Button 
            onClick={exportToPDF} 
            disabled={exporting}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold h-10 px-4 rounded-xl flex items-center gap-2"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Download size={16} />}
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>

        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Quiz Complete!</h2>
        <p className="text-slate-400 font-medium mb-10 max-w-sm">You have finished the quiz. Let's see how you performed.</p>

        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#1a2035" strokeWidth="8" fill="none" />
            <motion.circle cx="50" cy="50" r="40" 
              stroke={percentage >= 80 ? '#10b981' : percentage >= 50 ? '#3b82f6' : '#ef4444'} 
              strokeWidth="8" fill="none"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 40) * (1 - percentage / 100) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white font-mono tracking-tighter">{animatedScore}<span className="text-2xl">%</span></span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">
          <div><p className="text-slate-300 text-2xl font-black mb-1 font-mono">{attempt.score}/{attempt.total}</p>Correct</div>
          <div><p className="text-slate-300 text-2xl font-black mb-1 font-mono">{attempt.earnedMarks}</p>Marks</div>
          <div><p className="text-slate-300 text-2xl font-black mb-1 font-mono">{attempt.timeTaken}s</p>Time</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button onClick={() => handleRetake(false)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Retake Full Exam
          </Button>
          <Button onClick={() => handleRetake(true)} className="bg-[#1a2035] border border-white/10 hover:bg-[#252f4a] text-white font-bold h-12 px-8 rounded-xl">
            Retake Wrong Answers
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-12">
        <div className="bg-[#111827] border border-purple-500/20 p-8 rounded-[32px] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full pointer-events-none" />
          <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3"><BrainCircuit className="text-purple-400" /> AI Weak Area Analysis</h2>
          <p className="text-purple-200/60 font-medium mb-6">Discover exactly what subtopics you need to practice based on your mistakes.</p>
          
          {weakAreas ? (
            <div className="bg-[#0a0f1e]/50 border border-purple-500/20 p-6 rounded-2xl text-slate-300 font-medium text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: weakAreas.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          ) : (
            <Button onClick={analyzeWeakAreas} disabled={analyzing} className="bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              {analyzing ? "Analyzing Brainwaves..." : "Analyze Weak Areas"}
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-black text-white mt-4 mb-2 tracking-tight">Detailed Review</h3>
        {attempt.questions.slice(0, reviewCount).map((q, i) => {
          const uAns = attempt.userAnswers[q.id] || ""
          const hintsUsed = attempt.questionHints?.[q.id]?.hintsUsed || 0
          
          let isCorrect = false
          let isMultiselect = q.type === "multiselect"
          let cArr: string[] = []
          let uArr: string[] = []

          const marksPerQ = attempt.totalMarks / attempt.total
          let qEarned = 0
          
          let isPartiallyCorrect = false
          if (isMultiselect) {
            try {
              cArr = JSON.parse(q.correctAnswer)
              if (!Array.isArray(cArr)) cArr = [q.correctAnswer]
              uArr = JSON.parse(uAns || "[]")
              if (!Array.isArray(uArr)) uArr = []
              const correctPicks = uArr.filter(u => cArr.includes(u)).length
              const wrongPicks = uArr.filter(u => !cArr.includes(u)).length
              
              if (wrongPicks > 0) {
                isCorrect = false
                isPartiallyCorrect = false
                qEarned = 0
              } else {
                isCorrect = correctPicks === cArr.length
                isPartiallyCorrect = !isCorrect && correctPicks > 0
                qEarned = marksPerQ * (correctPicks / cArr.length)
              }
            } catch(e) { cArr = [q.correctAnswer]; uArr = [] }
          } else if (q.type === "fillintheblank") {
            isCorrect = uAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
            qEarned = isCorrect ? marksPerQ : 0
          } else {
            isCorrect = uAns === q.correctAnswer
            qEarned = isCorrect ? marksPerQ : 0
          }

          if (qEarned > 0) {
            qEarned = qEarned * (1 - (hintsUsed * 25) / 100)
          } else if (attempt.negativeMarking && uAns !== "") {
            qEarned = -(attempt.negativeMarking)
          }
          
          return (
            <div key={q.id} className={`bg-[#111827] border ${isCorrect ? "border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)]" : isPartiallyCorrect ? "border-yellow-500/30 shadow-[0_4px_20px_rgba(234,179,8,0.05)]" : "border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.05)]"} rounded-2xl p-6 transition-all`}>
              <div className="flex gap-4">
                <div className={`mt-1 shrink-0 flex items-center justify-center h-8 px-3 w-auto rounded-full text-[10px] font-black uppercase tracking-widest ${isCorrect ? "bg-emerald-500/20 text-emerald-400" : isPartiallyCorrect ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>
                  {isCorrect ? "Correct" : isPartiallyCorrect ? "Partial" : "Wrong"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-white text-lg mb-3 leading-snug">{q.text}</p>
                  
                  {q.type === "fillintheblank" ? (
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="bg-[#1a2035] px-4 py-3 rounded-xl border border-white/5">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Your Answer</span>
                        <span className={`font-mono font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>{uAns || "—"}</span>
                      </div>
                      {!isCorrect && (
                        <div className="bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
                          <span className="text-emerald-500/70 text-xs font-bold uppercase tracking-wider block mb-1">Correct Answer</span>
                          <span className="font-mono text-emerald-400 font-bold">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mb-4">
                      {q.options.map((o, idx) => {
                        const isSelected = isMultiselect ? uArr.includes(o) : uAns === o; 
                        const isActualCorrect = isMultiselect ? cArr.includes(o) : q.correctAnswer === o;
                        
                        let bClass = "bg-[#1a2035] border-white/5 text-slate-400"
                        if (isActualCorrect) bClass = "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        else if (isSelected && !isActualCorrect) bClass = "bg-red-500/20 border-red-500/30 text-red-300 font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        return (
                          <div key={o + idx} className={`px-4 py-3 rounded-xl border ${bClass} flex justify-between items-center`}>
                            <span>{o}</span>
                            {isSelected && <span className="text-xs font-bold tracking-widest uppercase ml-2 opacity-80">(Your Pick)</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-400 text-xs font-bold bg-[#1a2035] px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-white">{Math.round(qEarned * 10) / 10}</span> / {Math.round(marksPerQ * 10) / 10} Marks
                      </span>
                      <span className="text-slate-400 text-xs font-bold font-mono bg-[#1a2035] px-3 py-1.5 rounded-lg border border-white/5">
                        {attempt.questionTimings?.[q.id] ? `${attempt.questionTimings[q.id]}s` : "0s"}
                      </span>
                      {hintsUsed > 0 && <span className="text-amber-500 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">Used {hintsUsed} hint(s)</span>}
                    </div>
                    <ExplanationButton question={q.text} correctAnswer={q.correctAnswer} userAnswer={uAns} topic={attempt.topic} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {reviewCount < attempt.questions.length && (
          <Button variant="outline" onClick={() => setReviewCount((prev) => prev + 10)} className="w-full mt-4 font-bold tracking-widest text-slate-400 hover:text-white border-white/10 uppercase py-6">
            Load More Reviews
          </Button>
        )}
      </div>

      {attempt.aiChatEnabled && (
        <AIRetutorChat topic={attempt.topic} wrongQuestions={attempt.questions.filter((q) => {
          const u = attempt.userAnswers[q.id]
          if (q.type === 'multiselect') {
            try {
               const cArr = JSON.parse(q.correctAnswer) as string[]
               const uArrRaw = JSON.parse(u || "[]")
               const uArrReady = Array.isArray(uArrRaw) ? uArrRaw : []
               if(uArrReady.length !== cArr.length || uArrReady.some( (x:string) => !cArr.includes(x))) return true
            } catch(e) {}
          }
          return q.type === "fillintheblank" ? u?.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() : u !== q.correctAnswer
        }).map(q => ({ question: q.text, correctAnswer: q.correctAnswer, userAnswer: attempt.userAnswers[q.id] || "Skipped" }))} />
      )}

    </motion.div>
  )
}
