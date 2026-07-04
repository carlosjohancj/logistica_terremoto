"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import Indicators from "@/components/transportista/indicators"
import RequestManager from "@/components/transportista/request-manager"
import Timeline from "@/components/transportista/timeline"

type TravelRequest = {
  id: string
  user_id: string
  origin_city: string
  origin_state: string
  destination_city: string
  destination_state: string
  people_to_move: number
  notes: string
  status: string
}

type Profile = {
  name: string
  phone: string
}

type TimelineEntry = {
  id: string
  familyName: string
  route: string
  date: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
}

export default function TransportistaPage() {
  const router = useRouter()
  const [kmTotal, setKmTotal] = useState(0)
  const [viajesRealizados, setViajesRealizados] = useState(0)
  const [familiasAyudadas, setFamiliasAyudadas] = useState(0)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
  const [requests, setRequests] = useState<TravelRequest[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: transportOffers } = await supabase
      .from("transport_offers")
      .select("origin_state, origin_city")
      .eq("user_id", user.id)
      .eq("status", "open")

    const myStates = [...new Set((transportOffers || []).map((o: any) => o.origin_state))]

    let reqQuery = supabase
      .from("travel_requests")
      .select("*")
      .eq("status", "open")
      .neq("user_id", user.id)

    if (myStates.length > 0) {
      reqQuery = reqQuery.in("origin_state", myStates)
    }

    const { data: reqs } = await reqQuery.order("created_at", { ascending: false })
    setRequests((reqs || []) as TravelRequest[])

    const uniqueUserIds = [...new Set((reqs || []).map((r: any) => r.user_id))]
    if (uniqueUserIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .in("id", uniqueUserIds)
      const map: Record<string, Profile> = {}
      for (const p of (profs || [])) {
        map[(p as any).id] = { name: (p as any).name, phone: (p as any).phone || "" }
      }
      setProfiles(map)
    }

    const { data: matches } = await supabase
      .from("matches")
      .select("id, travel_request_id, status, created_at")
      .eq("user_id", user.id)

    const completed = (matches || []).filter((m: any) => m.status === "completed")
    setViajesRealizados(completed.length)

    const helpedFamilies = new Set(completed.map((m: any) => m.travel_request_id))
    setFamiliasAyudadas(helpedFamilies.size)

    const pending = (matches || []).filter((m: any) => m.status === "pending" || m.status === "in_progress")
    setSolicitudesPendientes(pending.length)

    const [segRes, timelineRes] = await Promise.all([
      fetch(`/api/route-segments?transportista_id=${user.id}`),
      fetch(`/api/route-segments?transportista_id=${user.id}&limit=20`),
    ])
    const segJson = await segRes.json()
    const timelineJson = await timelineRes.json()

    const totalKm = (segJson.segments || []).reduce((sum: number, s: any) => sum + (s.distance_km || 0), 0)
    setKmTotal(totalKm)

    const allMatchIds = [...new Set((matches || []).map((m: any) => m.id))]

    const timelineData: TimelineEntry[] = (timelineJson.segments || []).map((s: any) => {
      const match = (matches || []).find((m: any) => m.id === s.match_id)
      return {
        id: s.id,
        familyName: s.destination_city || "Destino",
        route: `${s.origin_city} → ${s.destination_city}`,
        date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "",
        status: s.status || "pending",
      }
    }) as TimelineEntry[]

    setTimeline(timelineData)
    setSolicitudesPendientes((reqs || []).length)
    setLoading(false)
  }

  function handleTakeRequest(req: Record<string, any>) {
    router.push(`/transportista/ruta?requestId=${req.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de Transportista</h1>
        <p className="text-muted-foreground">Gestiona tus rutas, solicitudes y comunicaciones</p>
      </div>

      <Indicators
        kmTotal={kmTotal}
        viajesRealizados={viajesRealizados}
        familiasAyudadas={familiasAyudadas}
        solicitudesPendientes={solicitudesPendientes}
      />

      <section>
        <h2 className="text-lg font-semibold mb-3">Solicitudes disponibles</h2>
        <RequestManager
          requests={requests}
          profiles={profiles}
          onTakeRequest={handleTakeRequest}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Historial de viajes</h2>
        <Timeline entries={timeline} />
      </section>
    </div>
  )
}
