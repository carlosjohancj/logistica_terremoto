"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { getCityCoord } from "@/lib/estados"
import { distance } from "@turf/turf"
import Indicators from "@/components/transportista/indicators"
import RequestManager from "@/components/transportista/request-manager"
import Timeline from "@/components/transportista/timeline"
import UpcomingSchedule from "@/components/transportista/upcoming-schedule"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { ClipboardList, History, CalendarDays } from "lucide-react"

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
  needs_cargo_transport?: boolean
  cargo_description?: string
  distance_km?: number
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
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const [kmTotal, setKmTotal] = useState(0)
  const [viajesRealizados, setViajesRealizados] = useState(0)
  const [familiasAyudadas, setFamiliasAyudadas] = useState(0)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
  const [requests, setRequests] = useState<TravelRequest[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [transportistaOffers, setTransportistaOffers] = useState<Array<{ capacity: number; origin_state: string; origin_city: string; accepts_passengers: boolean; accepts_cargo: boolean }>>([])
  const [matcherState, setMatcherState] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: offers } = await supabase
      .from("transport_offers")
      .select("capacity, origin_state, origin_city, accepts_passengers, accepts_cargo")
      .eq("user_id", user.id)
      .eq("status", "open")

    const offersList = (offers || []) as Array<{ capacity: number; origin_state: string; origin_city: string; accepts_passengers: boolean; accepts_cargo: boolean }>
    setTransportistaOffers(offersList)

    const myStates = [...new Set(offersList.map(o => o.origin_state))]

    let reqQuery = supabase
      .from("travel_requests")
      .select("*")
      .eq("status", "open")
      .neq("user_id", user.id)

    if (myStates.length > 0) {
      reqQuery = reqQuery.in("origin_state", myStates)
    }

    const { data: reqs } = await reqQuery.order("created_at", { ascending: false })

    let typedReqs = (reqs || []) as TravelRequest[]

    if (offersList.length > 0) {
      const withDistance = await Promise.all(
        typedReqs.map(async (req) => {
          const offer = offersList.find(o => o.origin_state === req.origin_state)
          if (!offer || !offer.origin_city || !req.origin_city) return { ...req, distance_km: 999 }

          const offerCoord = await getCityCoord(offer.origin_state, offer.origin_city)
          const reqCoord = await getCityCoord(req.origin_state, req.origin_city)
          if (!offerCoord || !reqCoord) return { ...req, distance_km: 999 }

          const km = distance(
            [offerCoord.lng, offerCoord.lat],
            [reqCoord.lng, reqCoord.lat],
            { units: "kilometers" },
          )
          return { ...req, distance_km: Math.round(km) }
        }),
      )
      withDistance.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999))
      typedReqs = withDistance
    }

    setRequests(typedReqs)

    const uniqueUserIds = [...new Set(typedReqs.map(r => r.user_id))]
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

    const timelineData: TimelineEntry[] = (timelineJson.segments || []).map((s: any) => {
      const match = (matches || []).find((m: any) => m.id === s.match_id)
      return {
        id: s.id,
        familyName: s.destination_city || "Destino",
        route: `${s.origin_city} → ${s.destination_city}`,
        date: s.scheduled_date || (s.created_at ? new Date(s.created_at).toLocaleDateString() : ""),
        status: s.status || "pending",
      }
    }) as TimelineEntry[]

    setTimeline(timelineData)
    setSolicitudesPendientes(typedReqs.length)
    setLoading(false)
  }

  function handleTakeRequest(req: Record<string, any>, scheduledDate?: string, estimatedHours?: number) {
    const params = new URLSearchParams({ requestId: req.id })
    if (scheduledDate) params.set("date", scheduledDate)
    if (estimatedHours) params.set("hours", String(estimatedHours))
    router.push(`/${locale}/transportista/ruta?${params.toString()}`)
  }

  const upcomingSegments = useMemo(() => {
    if (!timeline.length) return []
    return timeline
      .filter(e => e.status === "pending" || e.status === "in_progress")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }, [timeline])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        </div>
        <SkeletonGrid cols={4} count={4} />
        <SkeletonGrid cols={3} count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Transportista</h1>
        <p className="text-muted-foreground">Gestiona tus rutas, horarios y comunicaciones</p>
      </div>

      <Indicators
        kmTotal={kmTotal}
        viajesRealizados={viajesRealizados}
        familiasAyudadas={familiasAyudadas}
        solicitudesPendientes={solicitudesPendientes}
      />

      {upcomingSegments.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Próximas rutas</h2>
          </div>
          <UpcomingSchedule entries={upcomingSegments} />
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Solicitudes disponibles</h2>
          {requests.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {requests.length}
            </span>
          )}
        </div>
        <RequestManager
          requests={requests}
          profiles={profiles}
          onTakeRequest={handleTakeRequest}
          transportistaOffers={transportistaOffers}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Historial de viajes</h2>
        </div>
        <Timeline entries={timeline} />
      </section>
    </div>
  )
}
