import { useState } from "react"
import { useQuizStore } from "@/store/quizStore"
import { Question } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/Badge"

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  marksPerQuestion,
  hintsUsedForCurrent,
  allHintsForCurrent,
  markedQuestions,
  toggleMark,
  handleHint,
  hintLoading,
  shownHintLevel,
}: {
  question: Question
  currentIndex: number
  totalQuestions: number
  marksPerQuestion: number
  hintsUsedForCurrent: number
  allHintsForCurrent: string[]
  markedQuestions: Set<string>
  toggleMark: () => void
  handleHint: () => void
  hintLoading: boolean
  shownHintLevel: number
}) {
  const { userAnswers, answerQuestion, config } = useQuizStore()
  const [fillAnswer, setFillAnswer] = useState(userAnswers[question.id] || "")
  
  const selectedAnswer = userAnswers[question.id]
  const isFillInBlank = question.type === "fillintheblank"
  const isMulti = question.type === "multiselect"
  
  const handleSelect = (option: string) => {
    if (isMulti) {
      let currentArr: string[] = []
      try { currentArr = JSON.parse(selectedAnswer || "[]") } catch(e){}
      if (currentArr.includes(option)) {
        currentArr = currentArr.filter(o => o !== option)
      } else {
        currentArr.push(option)
      }
      answerQuestion(question.id, JSON.stringify(currentArr))
    } else {
      if (selectedAnswer === option) {
        answerQuestion(question.id, "")
      } else {
        answerQuestion(question.id, option)
      }
    }
  }
  
  const typeGlows = {
    mcq: "bg-[#111827] shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/30",
    truefalse: "bg-[#111827] shadow-[0_0_20px_rgba(168,85,247,0.3)] border-purple-500/30",
    fillintheblank: "bg-[#111827] shadow-[0_0_20px_rgba(249,115,22,0.3)] border-orange-500/30",
    multiselect: "bg-[#111827] shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500/30",
  }
  const glowClass = typeGlows[question.type as keyof typeof typeGlows] || typeGlows.mcq

  const marksAfterPenalty = Math.round(marksPerQuestion * (1 - [0, 25, 50, 75][hintsUsedForCurrent] / 100) * 10) / 10

  return (
    <motion.div 
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`border rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-500 ${glowClass}`}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-[#1a2035] text-slate-300 border-white/10 uppercase tracking-widest font-bold">
            {question.type === "mcq" ? "MCQ" : question.type === "truefalse" ? "T/F" : question.type === "multiselect" ? "Multiple Correct" : "Fill in Blank"}
          </Badge>
          <span className="text-xs font-mono font-semibold text-slate-400 bg-[#0a0f1e] px-2 py-1 rounded-md border border-white/5">
            {Math.round(marksPerQuestion * 10) / 10} marks
            {hintsUsedForCurrent > 0 && <span className="text-yellow-400 ml-1">→ {marksAfterPenalty} max</span>}
          </span>
        </div>
        {!isFillInBlank && (
          <div className="flex gap-1.5">
            {[1, 2, 3].map((level) => (
              <span key={level} className={`w-2 h-2 rounded-full ${hintsUsedForCurrent >= level ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "bg-slate-700"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-4 mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed tracking-tight">{question.text}</h2>
        <div className="flex flex-col gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMark}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              markedQuestions.has(question.id) ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]" : "bg-[#1a2035] border-white/10 text-slate-400 hover:bg-[#252f4a]"
            }`}
          >
            {markedQuestions.has(question.id) ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            )}
            Mark
          </motion.button>
          
          <button
            onClick={() => answerQuestion(question.id, "")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border bg-[#1a2035] border-white/10 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-left"
          >
            ✕ Clear Answer
          </button>
          
          {config?.hintsEnabled && !isFillInBlank && hintsUsedForCurrent < 3 && (
            <button
              onClick={handleHint}
              disabled={hintLoading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all disabled:opacity-50"
            >
              {hintLoading ? "..." : `💡 Hint ${hintsUsedForCurrent + 1}`}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isFillInBlank && allHintsForCurrent.slice(0, shownHintLevel).length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-col gap-2 mb-6 overflow-hidden">
            {allHintsForCurrent.slice(0, shownHintLevel).map((hint, hi) => (
              <div key={hi} className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm rounded-xl px-4 py-3 font-medium">
                <span className="font-bold text-amber-500 mr-2">Hint {hi + 1} (-{[25, 50, 75][hi]}%)</span>
                <span>{hint}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isFillInBlank ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {question.text.toLowerCase().includes("(numerical)") ? "Numerical Answer" : "Text Answer"}
            </span>
          </div>
          <input
            type={question.text.toLowerCase().includes("(numerical)") ? "number" : "text"}
            placeholder={question.text.toLowerCase().includes("(numerical)") ? "Enter number..." : "Type your precise answer here..."}
            value={fillAnswer}
            onChange={(e) => {
              setFillAnswer(e.target.value)
              answerQuestion(question.id, e.target.value)
            }}
            className="w-full bg-[#1a2035]/80 border-2 border-white/5 focus:border-blue-500 text-white rounded-2xl px-5 py-4 text-base font-medium outline-none transition-all shadow-inner"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isSelected = isMulti ? (() => {
              try { return JSON.parse(selectedAnswer || "[]").includes(option) } catch(e) { return false }
            })() : selectedAnswer === option
            
            const letters = ["A", "B", "C", "D", "E", "F"]
            return (
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ translateY: -2 }}
                key={index}
                onClick={() => handleSelect(option)}
                className={`flex items-center text-left px-5 py-4 rounded-2xl text-base font-bold transition-all relative overflow-hidden ${
                  isSelected 
                    ? "bg-blue-600 border-transparent text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)]" 
                    : "bg-[#1a2035] border border-white/5 text-slate-300 hover:bg-[#252f4a]"
                }`}
              >
                {question.type !== "truefalse" && (
                  <span className={`mr-4 px-2.5 py-1 rounded-lg text-xs font-mono font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-[#0a0f1e] text-slate-400'}`}>
                    {letters[index]}
                  </span>
                )}
                <span className="relative z-10 flex-1">{option}</span>
                
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 ml-3 shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
