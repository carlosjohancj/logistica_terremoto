"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/types/supabase"
import { getInitials, cn } from "@/lib/utils"
import { toast } from "sonner"
import { Send, MessageSquare, MapPin, Search, ArrowLeft, ArrowRight } from "lucide-react"
import { StatusBadge, getStatusMeta } from "@/components/perfil/status-badge"

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
    user_id?: string
  }
}

type Message = {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
}

type Profile = { name: string; phone: string }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatDateDivider(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(date, today)) return "Hoy"
  if (isSameDay(date, yesterday)) return "Ayer"
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "Ahora"
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "Ayer"
  if (diffD < 7) return `Hace ${diffD} d`
  return date.toLocaleDateString()
}

export default function MensajesPanel() {
  const [userId, setUserId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [counterpartProfiles, setCounterpartProfiles] = useState<Record<string, Profile>>({})
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({})
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const previousMatchIdRef = useRef<string | null>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch)
    }
  }, [selectedMatch])

  // Scrolls only the internal messages pane (never the page). Switching to a
  // different conversation jumps to the bottom instantly; a new message
  // arriving in the open conversation (e.g. after sending) scrolls smoothly.
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const isNewConversation = previousMatchIdRef.current !== selectedMatch
    previousMatchIdRef.current = selectedMatch
    container.scrollTo({ top: container.scrollHeight, behavior: isNewConversation ? "auto" : "smooth" })
  }, [messages, selectedMatch])

  async function loadMatches() {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const joinFields = "origin_city, origin_state, destination_city, user_id"
    const [asTransporter, asVictim] = await Promise.all([
      supabase
        .from("matches")
        .select(`*, travel_requests:travel_request_id(${joinFields})`)
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
          .select(`*, travel_requests:travel_request_id(${joinFields})`)
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

    const counterpartIds = [
      ...new Set(
        unique
          .map((m) => (m.user_id === user.id ? m.travel_requests?.user_id : m.user_id))
          .filter((id): id is string => Boolean(id))
      ),
    ]

    const matchIds = unique.map((m) => m.id)

    const [profilesRes, messagesRes] = await Promise.all([
      counterpartIds.length > 0
        ? (supabase.from("profiles").select("id, name, phone").in("id", counterpartIds) as never as {
            data: { id: string; name: string; phone: string }[] | null
          })
        : Promise.resolve({ data: [] as { id: string; name: string; phone: string }[] }),
      matchIds.length > 0
        ? (supabase
            .from("messages")
            .select("*")
            .in("match_id", matchIds)
            .order("created_at", { ascending: true }) as never as { data: Message[] | null })
        : Promise.resolve({ data: [] as Message[] }),
    ])

    const profileMap: Record<string, Profile> = {}
    for (const p of profilesRes.data ?? []) profileMap[p.id] = { name: p.name, phone: p.phone }
    setCounterpartProfiles(profileMap)

    const lastByMatch: Record<string, Message> = {}
    for (const msg of messagesRes.data ?? []) lastByMatch[msg.match_id] = msg
    setLastMessages(lastByMatch)

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
      setLastMessages((prev) => ({ ...prev, [selectedMatch]: json.message }))
      setNewMessage("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setSending(false)
    }
  }

  function counterpartFor(match: Match) {
    const counterpartId = match.user_id === userId ? match.travel_requests?.user_id : match.user_id
    return counterpartId ? counterpartProfiles[counterpartId] : undefined
  }

  const filteredMatches = useMemo(() => {
    if (!search.trim()) return matches
    const q = search.trim().toLowerCase()
    return matches.filter((m) => (counterpartFor(m)?.name || "").toLowerCase().includes(q))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, search, counterpartProfiles, userId])

  const messageGroups = useMemo(() => {
    const groups: { dateKey: string; items: Message[] }[] = []
    for (const msg of messages) {
      const key = new Date(msg.created_at).toDateString()
      const last = groups[groups.length - 1]
      if (last && last.dateKey === key) last.items.push(msg)
      else groups.push({ dateKey: key, items: [msg] })
    }
    return groups
  }, [messages])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-border bg-card">
        <p className="text-muted-foreground">Cargando conversaciones...</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">No tienes conversaciones aún</p>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">
          Las conversaciones se crean cuando tomas una solicitud o alguien toma la tuya.
        </p>
      </div>
    )
  }

  const activeMatch = matches.find((m) => m.id === selectedMatch)
  const activeCounterpart = activeMatch ? counterpartFor(activeMatch) : undefined

  return (
    <div className="flex h-[75vh] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Conversation list */}
      <div
        className={cn(
          "flex w-full shrink-0 flex-col border-r border-border md:w-80",
          selectedMatch && "hidden md:flex"
        )}
      >
        <div className="shrink-0 border-b border-border p-4">
          <h2 className="mb-3 font-bold">Mensajes recientes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="h-9 pl-9"
              aria-label="Buscar conversación"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredMatches.map((match) => {
            const counterpart = counterpartFor(match)
            const last = lastMessages[match.id]
            const isSelected = selectedMatch === match.id
            const meta = getStatusMeta(match.status)

            return (
              <button
                key={match.id}
                type="button"
                onClick={() => setSelectedMatch(match.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  isSelected ? "bg-primary/10" : "hover:bg-muted"
                )}
              >
                <span className="relative shrink-0">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
                    {getInitials(counterpart?.name || "?")}
                  </span>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      meta.dot
                    )}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{counterpart?.name || "Usuario"}</p>
                    {last && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelativeTime(last.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {last?.content || "Sin mensajes aún"}
                  </p>
                </div>
              </button>
            )
          })}
          {filteredMatches.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados.</p>
          )}
        </div>
      </div>

      {/* Active conversation */}
      <div className={cn("flex min-w-0 flex-1 flex-col", !selectedMatch && "hidden md:flex")}>
        {activeMatch && (
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={() => setSelectedMatch(null)}
              className="shrink-0 rounded-full p-1.5 hover:bg-muted md:hidden"
              aria-label="Volver a mensajes"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
              {getInitials(activeCounterpart?.name || "?")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{activeCounterpart?.name || "Usuario"}</p>
              {activeMatch.travel_requests && (
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {activeMatch.travel_requests.origin_city || activeMatch.travel_requests.origin_state}
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  {activeMatch.travel_requests.destination_city || "Sin destino"}
                </p>
              )}
            </div>
            <StatusBadge status={activeMatch.status} />
          </div>
        )}

        <div ref={messagesContainerRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {messageGroups.map((group) => (
            <div key={group.dateKey} className="space-y-3">
              <div className="flex justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {formatDateDivider(group.items[0].created_at)}
                </span>
              </div>
              {group.items.map((msg) => {
                const isOwn = msg.sender_id === userId
                return (
                  <div key={msg.id} className={cn("flex items-end gap-2 py-1", isOwn ? "justify-end" : "justify-start")}>
                    {!isOwn && (
                      <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary">
                        {getInitials(activeCounterpart?.name || "?")}
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        isOwn
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <p className={cn("mt-1 text-[10px]", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage() }}
          className="flex shrink-0 items-center gap-2 border-t border-border p-3"
        >
          <Input
            aria-label="Escribe un mensaje"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="h-10 rounded-full px-4"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
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
