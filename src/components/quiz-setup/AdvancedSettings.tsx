import * as React from "react"
import { Toggle } from "@/components/ui/Toggle"
import { Input } from "@/components/ui/Input"
import { motion, AnimatePresence } from "framer-motion"

interface AdvancedSettingsProps {
  timerEnabled: boolean
  setTimerEnabled: (val: boolean) => void
  timerHours: string
  setTimerHours: (val: string) => void
  timerMinutes: string
  setTimerMinutes: (val: string) => void
  timerSeconds: string
  setTimerSeconds: (val: string) => void
  hintsEnabled: boolean
  setHintsEnabled: (val: boolean) => void
  aiChatEnabled: boolean
  setAiChatEnabled: (val: boolean) => void
}

const HINT_RULES = [
  { level: "Hint 1", penalty: "25%", color: "text-green-400", desc: "Subtle clue, lose 25% of question marks" },
  { level: "Hint 2", penalty: "50%", color: "text-yellow-400", desc: "Moderate clue, lose 50% of question marks" },
  { level: "Hint 3", penalty: "75%", color: "text-red-400", desc: "Strong clue, lose 75% of question marks" },
]

export function AdvancedSettings(props: AdvancedSettingsProps) {
  const clamp = (val: string, max: number) => {
    if (val === "") return ""
    const num = parseInt(val)
    if (isNaN(num)) return "0"
    return Math.min(Math.max(0, num), max).toString()
  }

  return (
    <div className="flex flex-col gap-5 pt-3 border-t border-gray-800">
      
      {/* Timer */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">Set Timer</label>
          <Toggle checked={props.timerEnabled} onCheckedChange={props.setTimerEnabled} />
        </div>
        
        <AnimatePresence>
          {props.timerEnabled && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-3 overflow-hidden"
            >
              {[
                { label: "Hours", value: props.timerHours, max: 23, setter: props.setTimerHours },
                { label: "Minutes", value: props.timerMinutes, max: 59, setter: props.setTimerMinutes },
                { label: "Seconds", value: props.timerSeconds, max: 59, setter: props.setTimerSeconds },
              ].map(({ label, value, max, setter }) => (
                <div key={label} className="flex-1 flex flex-col gap-1.5 mt-2">
                  <label className="text-xs text-gray-500 text-center font-medium">{label}</label>
                  <Input
                    type="number" 
                    min={0} 
                    max={max} 
                    value={value}
                    onChange={(e) => setter(clamp(e.target.value, max))}
                    className="text-center font-bold text-lg"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hints */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">Enable AI Hints</label>
          <Toggle checked={props.hintsEnabled} onCheckedChange={props.setHintsEnabled} color="bg-yellow-500" />
        </div>
        
        <AnimatePresence>
          {props.hintsEnabled && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-2">
                <p className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Hints Work
                </p>
                <div className="flex flex-col gap-2 mb-3">
                  {HINT_RULES.map((h) => (
                    <div key={h.level} className="flex items-start gap-2">
                      <span className={`text-xs font-semibold ${h.color} shrink-0 w-14`}>{h.level}</span>
                      <span className="text-xs text-gray-400">{h.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-yellow-500/20 pt-2 flex flex-col gap-1">
                  <p className="text-xs text-yellow-500/70">• Must unlock hints in order (1 → 2 → 3)</p>
                  <p className="text-xs text-yellow-500/70">• Penalty applies only if you answer correctly</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Chat */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-gray-300">Enable AI Chat Tutor</label>
          <p className="text-xs text-gray-500 mt-0.5">Ask questions during results review</p>
        </div>
        <Toggle checked={props.aiChatEnabled} onCheckedChange={props.setAiChatEnabled} />
      </div>

    </div>
  )
}
