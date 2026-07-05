"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/lib/supabase"
import { toast } from "sonner"
import { MessageCircle, X } from "lucide-react"

type Match = {
  id: string
  travel_request_id: string
  status: string
  travel_request?: { origin_city: string; destination_city: string }
  profile?: { name: string }
}

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ChatFloating() {
  const [open, setOpen] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    loadMatches()
  }, [open])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.id)
    }
  }, [selectedMatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadMatches() {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from("matches")
      .select("id, travel_request_id, status, travel_request:travel_request_id(origin_city, destination_city)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20) as any

    if (data) setMatches(data)
  }

  async function loadMessages(matchId: string) {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })

    if (data) setMessages(data as Message[])
  }

  async function sendMessage() {
    if (!text.trim() || !selectedMatch || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: selectedMatch.id, content: text }),
      })
      if (!res.ok) throw new Error("Error al enviar")
      setText("")
      await loadMessages(selectedMatch.id)
    } catch {
      toast.error("Error al enviar mensaje")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="chat-floating-panel"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center"
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>

      {open && (
        <Card id="chat-floating-panel" role="region" aria-label="Mensajes" className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] shadow-xl flex flex-col">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm">Mensajes</CardTitle>
          </CardHeader>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-1/3 border-r overflow-y-auto">
                <div className="p-1 space-y-0.5">
                  {matches.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMatch(m)}
                      aria-pressed={selectedMatch?.id === m.id}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs ${
                        selectedMatch?.id === m.id ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <p className="font-medium truncate">
                        {m.travel_request?.origin_city || "Ruta"}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {m.travel_request?.destination_city || ""}
                      </p>
                    </button>
                  ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
              {selectedMatch ? (
                <>
                  <div className="flex-1 p-2 overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-2 ${msg.sender_id === userId ? "text-right" : "text-left"}`}
                      >
                        <span
                          className={`inline-block px-2.5 py-1.5 rounded-lg text-xs max-w-[80%] ${
                            msg.sender_id === userId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.content}
                        </span>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                  <div className="p-2 border-t flex gap-2">
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="h-8 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button size="sm" onClick={sendMessage} disabled={sending || !text.trim()}>
                      Enviar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Selecciona una conversación
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
