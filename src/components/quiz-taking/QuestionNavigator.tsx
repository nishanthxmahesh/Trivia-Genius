"use client"

import { useState } from "react"
import { useQuizStore } from "@/store/quizStore"
import { Question } from "@/types/quiz"
import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"

export function QuestionNavigator({
  questions,
  currentIndex,
  markedQuestions,
  visitedQuestions,
  handleFinish
}: {
  questions: Question[]
  currentIndex: number
  markedQuestions: Set<string>
  visitedQuestions: Set<string>
  handleFinish: () => void
}) {
  const [navOpen, setNavOpen] = useState(false)
  const { setCurrentIndex, userAnswers, questionHints, config } = useQuizStore()

  const answeredCount = Object.keys(userAnswers).length
  const unansweredCount = questions.length - answeredCount
  const marksPerQuestion = config ? config.totalMarks / questions.length : 0

  const getQuestionStatus = (q: Question) => {
    if (markedQuestions.has(q.id)) return "marked"
    if (userAnswers[q.id]) return "answered"
    if (visitedQuestions.has(q.id)) return "visited"
    return "unopened"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-500 text-white"
      case "visited": return "bg-red-500 text-white"
      case "marked": return "bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]"
      default: return "bg-gray-800 text-gray-400 hover:bg-gray-700"
    }
  }

  const renderGrid = () => (
    <div className="grid grid-cols-5 gap-2.5">
      {questions.map((q, index) => {
        const status = getQuestionStatus(q)
        const hasHints = (questionHints[q.id]?.hintsUsed || 0) > 0
        const isCurrent = currentIndex === index

        return (
          <motion.button
            whileTap={{ scale: 0.9 }}
            key={q.id}
            onClick={() => { setCurrentIndex(index); setNavOpen(false) }}
            className={`relative w-full aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
              isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 z-10 scale-110" : "hover:scale-105"
            } ${getStatusColor(status)}`}
          >
            {index + 1}
            {hasHints && <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">💡</span>}
          </motion.button>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Desktop Navigator */}
      <div className="hidden md:flex flex-col w-72 shrink-0 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sticky top-6 shadow-2xl">
          <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4">Navigator</h3>
          
          {renderGrid()}

          <div className="border-t border-gray-800 pt-4 mt-5 flex flex-col gap-2">
            {[
              { color: "bg-green-500", label: "Answered" },
              { color: "bg-red-500", label: "Visited, not answered" },
              { color: "bg-purple-500", label: "Marked for review" },
              { color: "bg-gray-800", label: "Not opened" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-md shadow-sm ${item.color}`} />
                <span className="text-xs font-semibold text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4 flex gap-2">
            <div className="flex-1 bg-gray-800/50 rounded-xl p-3 text-center border border-gray-800">
              <p className="text-xl font-black text-green-400">{answeredCount}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Answered</p>
            </div>
            <div className="flex-1 bg-gray-800/50 rounded-xl p-3 text-center border border-gray-800">
              <p className="text-xl font-black text-gray-400">{unansweredCount}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remaining</p>
            </div>
          </div>

          <Button 
            onClick={handleFinish}
            className="w-full mt-5 bg-green-600 hover:bg-green-500 text-white font-bold h-12 rounded-xl"
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Mobile Nav Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setNavOpen(!navOpen)}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-20 border border-blue-400/30"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {navOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
          {unansweredCount}
        </span>
      </motion.button>

      {/* Mobile Nav Panel */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-6 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest">Navigator</h3>
              <p className="text-xs font-bold text-gray-500">{answeredCount} Ans / {unansweredCount} Rem</p>
            </div>
            
            <div className="max-h-[40vh] overflow-y-auto mb-5 pr-2 custom-scrollbar">
              {renderGrid()}
            </div>
            
            <Button 
              onClick={() => { setNavOpen(false); handleFinish(); }}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-14 rounded-xl"
            >
              Submit Exam
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNavOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-0"
          />
        )}
      </AnimatePresence>
    </>
  )
}
