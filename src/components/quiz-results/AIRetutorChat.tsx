import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, User, Presentation } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ChatMessage } from "@/types/quiz"

export function AIRetutorChat({ topic, wrongQuestions }: { topic: string, wrongQuestions: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: `Hi! I'm your AI Retutor. I see you missed a few questions on **${topic}**. Would you like me to explain any of them, or should we go over the concepts together?` }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    const context = wrongQuestions.map(q => `Q: ${q.question}\nCorrect: ${q.correctAnswer}\nUser's wrong pick: ${q.userAnswer}`).join("\n\n")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat({ role: "user", content: input })
        })
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }])
      } else {
        throw new Error("Chat failed")
      }
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-purple-600 text-white rounded-full p-4 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:bg-purple-500 transition-colors pointer-events-auto"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] bg-[#111827] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-50 overflow-hidden pointer-events-auto max-h-[600px]"
          >
            <div className="bg-[#1a2035] p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2 text-white font-bold">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 text-purple-400"><Bot size={18} /></div>
                AI Retutor Chat
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-white border ${m.role === "user" ? "bg-blue-600 border-blue-500" : "bg-purple-600 border-purple-500"}`}>
                    {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${m.role === "user" ? "bg-blue-600/20 text-blue-100 rounded-tr-sm border-blue-500/30 border" : "bg-[#1a2035] text-slate-300 rounded-tl-sm border border-white/5"} max-w-[80%]`}>
                    <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                  </div>
                </div>
              ))}
              {loading && <div className="text-slate-500 text-xs italic ml-12">AI is typing...</div>}
            </div>

            <div className="p-4 bg-[#1a2035] border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Ask about your mistakes..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="flex-1 bg-[#0a0f1e] text-white border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-purple-500 transition-colors text-sm"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-xl text-white">
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
