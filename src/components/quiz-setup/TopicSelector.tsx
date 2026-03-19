import * as React from "react"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

interface TopicSelectorProps {
  topic: string
  onChange: (val: string) => void
  onEnter: () => void
}

const TOPIC_SUGGESTIONS = [
  "Cricket", "Science", "History", "Movies",
  "Geography", "Music", "Sports", "Technology",
  "Math", "Politics", "Animals", "Food",
]

export function TopicSelector({ topic, onChange, onEnter }: TopicSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-gray-300">Quiz Topic</label>
      <Input
        type="text"
        placeholder="e.g. World War 2, Python, Basketball..."
        value={topic}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
      />
      <div className="flex flex-wrap gap-2 mt-1 -mx-1 px-1">
        {TOPIC_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="focus:outline-none"
            type="button"
          >
            <Badge variant={topic === s ? "default" : "secondary"} className="hover:bg-gray-700 hover:text-white transition-colors cursor-pointer px-3 py-1">
              {s}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
