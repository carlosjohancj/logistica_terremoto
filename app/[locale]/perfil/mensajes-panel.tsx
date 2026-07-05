"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, MessageSquare } from "lucide-react"

type Match = {
  id: string
  travel_request_id: string
  user_id: string
  status: string
  created_at: string
  travel_requests?: {
    origin_city: string
    origin_state: string
    destination_city: string
  }
  profiles?: {
    name: string
  }
}

type Message = {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function MensajesPanel() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch)
    }
  }, [selectedMatch])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadMatches() {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [asTransporter, asVictim] = await Promise.all([
      supabase
        .from("matches")
        .select("*, travel_requests:travel_request_id(origin_city, origin_state, destination_city)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as never as { data: Match[] | null },
      (async () => {
        const { data: myReqs } = await supabase
          .from("travel_requests")
          .select("id")
          .eq("user_id", user.id) as never as { data: { id: string }[] | null }
        const reqIds = (myReqs ?? []).map((r) => r.id)
        if (reqIds.length === 0) return { data: [] as Match[] }
        return supabase
          .from("matches")
          .select("*, travel_requests:travel_request_id(origin_city, origin_state, destination_city)")
          .in("travel_request_id", reqIds)
          .order("created_at", { ascending: false }) as never as { data: Match[] | null }
      })(),
    ])

    const all = [...(asTransporter.data ?? []), ...(asVictim.data ?? [])]
    const seen = new Set<string>()
    const unique = all.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })

    setMatches(unique)
    if (unique.length > 0 && !selectedMatch) {
      setSelectedMatch(unique[0].id)
    }
    setLoading(false)
  }

  async function loadMessages(matchId: string) {
    const supabase = getSupabase()
    const { data } = await (supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true }) as never as { data: Message[] | null })
    setMessages(data ?? [])
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedMatch) return
    setSending(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: selectedMatch, sender_id: user.id, content: newMessage.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al enviar mensaje")

      setMessages((prev) => [...prev, json.message])
      setNewMessage("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando...</p>

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-muted-foreground">No tienes conversaciones aún.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Las conversaciones se crean cuando tomas una solicitud o alguien toma la tuya.
        </p>
      </div>
    )
  }

  const activeMatch = matches.find((m) => m.id === selectedMatch)

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[60vh]">
      <div className="md:w-72 shrink-0 space-y-2 overflow-y-auto">
        {matches.map((match) => (
          <Card
            key={match.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedMatch === match.id}
            className={`cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedMatch === match.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedMatch(match.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setSelectedMatch(match.id)
              }
            }}
          >
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate">
                {match.travel_requests?.origin_city || "Viaje"}
              </p>
              <p className="text-xs text-muted-foreground">
                {match.travel_requests?.origin_state} → {match.travel_requests?.destination_city || "?"}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {match.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex-1 flex flex-col border rounded-lg p-4">
        {activeMatch && (
          <div className="text-sm text-muted-foreground mb-3 border-b pb-2">
            {activeMatch.travel_requests?.origin_city || activeMatch.travel_requests?.origin_state}
            {" → "}
            {activeMatch.travel_requests?.destination_city || "Sin destino"}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%] self-start">
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage() }}
          className="flex gap-2"
        >
          <Input
            aria-label="Escribe un mensaje"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            aria-busy={sending}
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  )
}
