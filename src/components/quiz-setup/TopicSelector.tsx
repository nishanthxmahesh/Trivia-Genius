import * as React from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/Input"
import { useQuizStore } from "@/store/quizStore"

interface TopicSelectorProps {
  topic: string
  onChange: (val: string) => void
  onEnter: () => void
}

const TOPIC_SUGGESTIONS = [
  "General Knowledge", "Science", "History", "Geography",
  "Pop Culture", "Movies", "Music", "Literature",
  "Technology", "Sports", "Art", "Video Games",
  "Math", "Politics", "Animals", "Food",
]

export function TopicSelector({ topic, onChange, onEnter }: TopicSelectorProps) {
  const { customTopics } = useQuizStore()
  const [placeholderValue, setPlaceholderValue] = React.useState("")
  const [suggestionIdx, setSuggestionIdx] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Typewriter effect for placeholder
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    const currentWord = TOPIC_SUGGESTIONS[suggestionIdx]
    
    if (isDeleting) {
      if (placeholderValue === "") {
        setIsDeleting(false)
        setSuggestionIdx((prev) => (prev + 1) % TOPIC_SUGGESTIONS.length)
      } else {
        timer = setTimeout(() => setPlaceholderValue(placeholderValue.slice(0, -1)), 60)
      }
    } else {
      if (placeholderValue === currentWord) {
        timer = setTimeout(() => setIsDeleting(true), 2000)
      } else {
        timer = setTimeout(() => setPlaceholderValue(currentWord.slice(0, placeholderValue.length + 1)), 100)
      }
    }
    return () => clearTimeout(timer)
  }, [placeholderValue, isDeleting, suggestionIdx])

  const allSuggestions = Array.from(new Set([...customTopics, ...TOPIC_SUGGESTIONS])).slice(0, 16)

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-bold text-slate-300">Quiz Topic</label>
      <Input
        type="text"
        placeholder={`e.g. ${placeholderValue}|`}
        value={topic}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        className="text-lg transition-shadow duration-300 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      />
      <div className="flex flex-wrap gap-2 mt-2 -mx-1 px-1">
        {allSuggestions.map((s) => {
          const isSelected = topic === s;
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              key={s}
              onClick={() => onChange(s)}
              type="button"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                isSelected 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-[0_0_15px_rgba(139,92,246,0.4)]" 
                  : "bg-[#1a2035] border-white/10 text-slate-400 hover:bg-[#252f4a] hover:border-white/20 hover:text-white"
              }`}
            >
                {s}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
