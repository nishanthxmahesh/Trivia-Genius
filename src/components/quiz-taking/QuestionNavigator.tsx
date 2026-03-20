import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Question } from "@/types/quiz"
import { useQuizStore } from "@/store/quizStore"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function QuestionNavigator({
  questions,
  currentIndex,
  markedQuestions,
  visitedQuestions,
  handleFinish,
  handleQuit,
  isSubmitDisabled,
}: {
  questions: Question[]
  currentIndex: number
  markedQuestions: Set<string>
  visitedQuestions: Set<string>
  handleFinish: () => void
  handleQuit: () => void
  isSubmitDisabled?: boolean
}) {
  const [navOpen, setNavOpen] = useState(false)
  const { setCurrentIndex, userAnswers, questionHints, config } = useQuizStore()

  const getStatusParams = (index: number) => {
    const qid = questions[index].id
    const isCurrent = index === currentIndex
    const isMarked = markedQuestions.has(qid)
    const isAnswered = !!userAnswers[qid]
    const isVisited = visitedQuestions.has(qid)

    let color = "bg-[#1a2035] text-slate-400 border border-white/5" // Unopened (dark blue slate)
    if (isAnswered) color = "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border-transparent"
    else if (isMarked) color = "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border-transparent"
    else if (isVisited) color = "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-transparent"
    
    return {
      color,
      isCurrent,
      isMarked
    }
  }

  return (
    <>
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setNavOpen(!navOpen)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center border border-white/10"
        >
          {navOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {navOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="md:hidden fixed inset-x-4 bottom-24 bg-[#111827]/95 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] z-40"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-white text-xl uppercase tracking-widest">Navigator</h3>
              <p className="text-slate-400 font-bold text-sm">{Object.keys(userAnswers).length} / {questions.length} done</p>
            </div>
            <div className="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2 pb-2">
              {questions.map((q, i) => {
                const s = getStatusParams(i)
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(i); setNavOpen(false) }}
                    className={`relative w-12 h-12 flex items-center justify-center rounded-xl font-mono font-bold text-lg transition-all ${s.color} ${s.isCurrent ? "ring-4 ring-white ring-offset-2 ring-offset-[#111827]" : ""}`}
                  >
                    {i + 1}
                    {s.isMarked && !userAnswers[q.id] && <span className="absolute -top-1 -right-1 leading-none text-xs">★</span>}
                  </button>
                )
              })}
            </div>
            
            <Button 
              onClick={() => { setNavOpen(false); handleFinish(); }}
              className={`w-full font-bold h-14 rounded-xl mt-6 tracking-widest uppercase transition-all ${isSubmitDisabled ? "bg-slate-700 text-slate-400 shadow-none hover:bg-slate-700 border-transparent cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
            >
              Review & Submit
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:flex flex-col bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-full shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-3xl" />
        <h3 className="font-black mb-1 text-white text-xl tracking-tight relative z-10">Question Grid</h3>
        <p className="text-slate-400 font-bold text-sm mb-4 pb-4 border-b border-white/10 relative z-10">
          {Object.keys(userAnswers).length} / {questions.length} answered
        </p>
        
        <div className="grid grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto p-2 flex-[-1] relative z-10 content-start nav-scrollbar max-h-[50vh] -mx-2">
          {questions.map((q, i) => {
             const s = getStatusParams(i)
            return (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`relative w-full aspect-square flex items-center justify-center rounded-xl font-mono font-bold text-base transition-all duration-300 ${s.color} ${s.isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-[#111827]" : ""}`}
              >
                {i + 1}
                {s.isMarked && <span className="absolute -top-1.5 -right-1.5 leading-none text-xs">★</span>}
              </motion.button>
            )
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 relative z-10 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-4">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Answered</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Visited</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-600 rounded-sm"></span> Marked</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#1a2035] rounded-sm"></span> Unopened</div>
          </div>
          
          <AnimatePresence>
            {questions[currentIndex]?.type === "multiselect" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-3 rounded-xl mb-4 leading-relaxed tracking-wide">
                <strong className="block mb-1">Multiple Correct Rule:</strong>
                Earn partial marks for correct options. ALL partial points are lost if you pick any wrong option.
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button 
            onClick={handleFinish}
            className={`w-full font-bold h-12 rounded-xl tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] ${isSubmitDisabled ? "bg-slate-700 text-slate-400 shadow-none hover:bg-slate-700 border-transparent cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
          >
            Review & Submit
          </Button>
        </div>
      </div>
    </>
  )
}
