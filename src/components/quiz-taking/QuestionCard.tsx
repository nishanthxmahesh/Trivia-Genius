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
  const badge = {
    label: question.type === "mcq" ? "MCQ" : question.type === "truefalse" ? "T/F" : "Fill in Blank",
    color: question.type === "mcq" ? "default" : question.type === "truefalse" ? "success" : "warning",
  } as const
  
  const marksAfterPenalty = Math.round(marksPerQuestion * (1 - [0, 25, 50, 75][hintsUsedForCurrent] / 100) * 10) / 10

  return (
    <motion.div 
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Badge variant={badge.color}>{badge.label}</Badge>
          <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
            {Math.round(marksPerQuestion * 10) / 10} marks
            {hintsUsedForCurrent > 0 && <span className="text-yellow-400 ml-1">→ {marksAfterPenalty} max</span>}
          </span>
        </div>
        {!isFillInBlank && (
          <div className="flex gap-1.5">
            {[1, 2, 3].map((level) => (
              <span key={level} className={`w-2 h-2 rounded-full ${hintsUsedForCurrent >= level ? "bg-yellow-400" : "bg-gray-700"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-4 mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">{question.text}</h2>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={toggleMark}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              markedQuestions.has(question.id) ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {markedQuestions.has(question.id) ? "★ Marked" : "☆ Mark"}
          </button>
          
          {config?.hintsEnabled && !isFillInBlank && hintsUsedForCurrent < 3 && (
            <button
              onClick={handleHint}
              disabled={hintLoading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all disabled:opacity-50"
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
              <div key={hi} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm rounded-xl px-4 py-3 font-medium">
                <span className="font-bold text-yellow-500 mr-2">Hint {hi + 1} (-{[25, 50, 75][hi]}%)</span>
                <span>{hint}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isFillInBlank ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Type your precise answer here..."
            value={fillAnswer}
            onChange={(e) => {
              setFillAnswer(e.target.value)
              answerQuestion(question.id, e.target.value)
            }}
            className="w-full bg-gray-800 border-2 border-gray-700 focus:border-blue-500 text-white rounded-2xl px-5 py-4 text-lg font-medium outline-none transition-colors"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const letters = ["A", "B", "C", "D"]
            return (
              <motion.button
                whileTap={{ scale: 0.99 }}
                key={index}
                onClick={() => answerQuestion(question.id, option)}
                className={`flex items-center text-left px-5 py-4 rounded-2xl text-base font-semibold border-2 transition-all ${
                  isSelected 
                    ? "bg-blue-600/10 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600"
                }`}
              >
                {question.type !== "truefalse" && (
                  <span className={`mr-4 px-2 py-0.5 rounded-lg text-sm ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {letters[index]}
                  </span>
                )}
                {option}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
