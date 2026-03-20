import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/Input"
import { Settings, Key, MessageSquare, Clock, ShieldCheck } from "lucide-react"

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
  requireAllAnswers: boolean
  setRequireAllAnswers: (val: boolean) => void
  minTimeLimitEnabled: boolean
  setMinTimeLimitEnabled: (val: boolean) => void
  minTimeHours: string
  setMinTimeHours: (val: string) => void
  minTimeMinutes: string
  setMinTimeMinutes: (val: string) => void
  minTimeSeconds: string
  setMinTimeSeconds: (val: string) => void
  negativeMarkingEnabled: boolean
  setNegativeMarkingEnabled: (val: boolean) => void
  negativeMarks: string
  setNegativeMarks: (val: string) => void
}

export function AdvancedSettings({
  timerEnabled, setTimerEnabled, timerHours, setTimerHours, timerMinutes, setTimerMinutes, timerSeconds, setTimerSeconds,
  hintsEnabled, setHintsEnabled, aiChatEnabled, setAiChatEnabled,
  requireAllAnswers, setRequireAllAnswers,
  minTimeLimitEnabled, setMinTimeLimitEnabled, minTimeHours, setMinTimeHours, minTimeMinutes, setMinTimeMinutes, minTimeSeconds, setMinTimeSeconds,
  negativeMarkingEnabled, setNegativeMarkingEnabled, negativeMarks, setNegativeMarks
}: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const Toggle = ({ enabled, onToggle, activeColor = "bg-blue-600" }: { enabled: boolean; onToggle: () => void; activeColor?: string }) => (
    <button type="button" onClick={onToggle} className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${enabled ? activeColor : "bg-[#1a2035]"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  )

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors self-start pb-2 border-b border-white/5"
      >
        <Settings className="w-4 h-4" /> {isOpen ? "Hide Advanced Settings" : "Show Advanced Settings"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 overflow-hidden mt-2">
            
            {/* Countdown Timer */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#0a0f1e]/50 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Countdown Timer</label>
                  <p className="text-xs text-slate-500 mt-0.5">Quiz auto-submits when time runs out</p>
                </div>
                <Toggle enabled={timerEnabled} onToggle={() => setTimerEnabled(!timerEnabled)} />
              </div>
              <AnimatePresence>
                {timerEnabled && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-3 mt-2">
                    {[
                      { l: "Hrs", v: timerHours, s: setTimerHours, max: 23 },
                      { l: "Min", v: timerMinutes, s: setTimerMinutes, max: 59 },
                      { l: "Sec", v: timerSeconds, s: setTimerSeconds, max: 59 },
                    ].map((t) => (
                      <div key={t.l} className="flex-1">
                        <Input
                          type="number" min={0} max={t.max} value={t.v}
                          onKeyDown={(e) => { if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault() }}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            t.s(isNaN(val) ? "" : Math.min(Math.max(0, val), t.max).toString());
                          }}
                          className="font-mono text-center px-1"
                        />
                        <div className="text-[10px] text-center text-slate-500 mt-1 uppercase tracking-wider font-bold">{t.l}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Minimum Time Limit */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#0a0f1e]/50 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4 text-red-400" /> Minimum Time Limit</label>
                  <p className="text-xs text-slate-500 mt-0.5">Prevent submission before time elapses</p>
                </div>
                <Toggle enabled={minTimeLimitEnabled} onToggle={() => setMinTimeLimitEnabled(!minTimeLimitEnabled)} activeColor="bg-red-600" />
              </div>
              <AnimatePresence>
                {minTimeLimitEnabled && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-3 mt-2">
                    {[
                      { l: "Hrs", v: minTimeHours, s: setMinTimeHours, max: 23 },
                      { l: "Min", v: minTimeMinutes, s: setMinTimeMinutes, max: 59 },
                      { l: "Sec", v: minTimeSeconds, s: setMinTimeSeconds, max: 59 },
                    ].map((t) => (
                      <div key={t.l} className="flex-1">
                        <Input
                          type="number" min={0} max={t.max} value={t.v}
                          onKeyDown={(e) => { if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault() }}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            t.s(isNaN(val) ? "" : Math.min(Math.max(0, val), t.max).toString());
                          }}
                          className="font-mono text-center px-1"
                        />
                        <div className="text-[10px] text-center text-slate-500 mt-1 uppercase tracking-wider font-bold">{t.l}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Negative Marking */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#0a0f1e]/50 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-orange-400" /> Negative Marking</label>
                  <p className="text-xs text-slate-500 mt-0.5">Incorrect answers deduct exact marks</p>
                </div>
                <Toggle enabled={negativeMarkingEnabled} onToggle={() => setNegativeMarkingEnabled(!negativeMarkingEnabled)} activeColor="bg-orange-600" />
              </div>
              <AnimatePresence>
                {negativeMarkingEnabled && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-3 mt-2 items-center">
                    <span className="text-sm text-slate-400 font-bold">Marks to deduct:</span>
                    <Input
                      type="number" step="0.5" min="0" value={negativeMarks}
                      onKeyDown={(e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault() }}
                      onChange={(e) => setNegativeMarks(e.target.value)}
                      className="font-mono text-center px-2 py-1 w-24 border-orange-500/30 focus:border-orange-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Require All Answers */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0f1e]/50 border border-white/5">
              <div>
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Require All Answers</label>
                <p className="text-xs text-slate-500 mt-0.5">Submission locked until 100% completed</p>
              </div>
              <Toggle enabled={requireAllAnswers} onToggle={() => setRequireAllAnswers(!requireAllAnswers)} activeColor="bg-emerald-600" />
            </div>

            {/* Progressive Hints */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#0a0f1e]/50 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><Key className="w-4 h-4 text-amber-400" /> Progressive Hints</label>
                  <p className="text-xs text-slate-500 mt-0.5">Use AI hints during quiz for a score penalty</p>
                </div>
                <Toggle enabled={hintsEnabled} onToggle={() => setHintsEnabled(!hintsEnabled)} activeColor="bg-amber-500" />
              </div>
            </div>

            {/* Post-Quiz AI Chat */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0f1e]/50 border border-white/5">
              <div>
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-400" /> Post-Quiz AI Chat</label>
                <p className="text-xs text-slate-500 mt-0.5">Chat with AI to review wrong answers</p>
              </div>
              <Toggle enabled={aiChatEnabled} onToggle={() => setAiChatEnabled(!aiChatEnabled)} activeColor="bg-purple-600" />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
