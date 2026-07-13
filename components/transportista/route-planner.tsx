"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getSupabase } from "@/lib/supabase"
import { getCityCoord } from "@/lib/estados"
import { fetchRoute } from "@/lib/maps/fetch-route"
import { AlertTriangle, Users, XCircle } from "lucide-react"

const MapWithNoSSR = dynamic(
  () => import("./route-planner-map"),
  { ssr: false }
)

export type Segment = {
  id?: string
  order: number
  origin_city: string
  origin_state: string
  destination_city: string
  destination_state: string
  distance_km: number
  status: string
  lat?: number
  lng?: number
  destLat?: number
  destLng?: number
  route_geometry?: [number, number][]
  transportista_id?: string
  transportista_name?: string
}

type Props = {
  travelRequestId: string
  originCity: string
  originState: string
  destCity: string
  destState: string
  onComplete: () => void
  scheduledDate?: string
  estimatedHours?: number
}

export default function RoutePlanner({ travelRequestId, originCity, originState, destCity, destState, onComplete, scheduledDate, estimatedHours }: Props) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [allSegments, setAllSegments] = useState<Segment[]>([])
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [originCoord, setOriginCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [destCoord, setDestCoord] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    Promise.all([
      getCityCoord(originState, originCity),
      getCityCoord(destState, destCity),
    ]).then(([o, d]) => {
      if (o) setOriginCoord(o)
      if (d) setDestCoord(d)
    })
  }, [originState, originCity, destState, destCity])

  useEffect(() => {
    if (currentUserId) loadSegments()
  }, [travelRequestId, currentUserId])

  async function loadSegments() {
    try {
      const [mySegRes, allSegRes] = await Promise.all([
        fetch(`/api/route-segments?travel_request_id=${travelRequestId}&include_profile=true`),
        fetch(`/api/route-segments?travel_request_id=${travelRequestId}&include_profile=true`),
      ])
      const myJson = await mySegRes.json()
      const allJson = await allSegRes.json()
      const parsed = (myJson.segments || []).map((s: any) => {
        let geo: [number, number][] | undefined
        if (s.route_geometry) {
          try {
            geo = typeof s.route_geometry === "string"
              ? JSON.parse(s.route_geometry)
              : s.route_geometry
          } catch {}
        }
        return {
          id: s.id,
          order: s.order,
          origin_city: s.origin_city,
          origin_state: s.origin_state,
          destination_city: s.destination_city,
          destination_state: s.destination_state,
          distance_km: s.distance_km,
          status: s.status,
          lat: s.origin_lat,
          lng: s.origin_lng,
          destLat: s.destination_lat,
          destLng: s.destination_lng,
          route_geometry: geo,
          transportista_id: s.transportista_id,
          transportista_name: s.profiles?.name,
        }
      })
      setAllSegments(parsed)
      setSegments(parsed.filter((s: Segment) => s.transportista_id === currentUserId || !s.transportista_id))
    } catch {
      // ignore
    }
  }

  const [currentUserId, setCurrentUserId] = useState<string>("")
  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  const mySegments = segments.filter(s => s.transportista_id === currentUserId)
  const otherSegments = allSegments.filter(s => s.transportista_id && s.transportista_id !== currentUserId)
  const totalSegmentsNeeded = allSegments.length > 0 ? Math.max(...allSegments.map(s => s.order)) : 1
  const coveredByOthers = otherSegments.filter(s => s.status !== "cancelled").length

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (saving) return
    setSaving(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const prevSegment = mySegments[mySegments.length - 1]
      const segOrigin = prevSegment
        ? { city: prevSegment.destination_city, state: prevSegment.destination_state, lat: prevSegment.destLat!, lng: prevSegment.destLng! }
        : { city: originCity, state: originState, lat: originCoord?.lat || 0, lng: originCoord?.lng || 0 }

      const destName = `Punto ${mySegments.length + 1}`
      const order = mySegments.length + 1

      let distanceKm: number
      let routeGeo: [number, number][] | null = null

      const valhalla = await fetchRoute(segOrigin.lng, segOrigin.lat, lng, lat)
      if (valhalla) {
        distanceKm = valhalla.distanceKm
        routeGeo = valhalla.geometry
      } else {
        const { distance } = await import("@turf/turf")
        distanceKm = Math.round(distance([segOrigin.lng, segOrigin.lat], [lng, lat], { units: "kilometers" }) * 10) / 10
      }

      const body: Record<string, unknown> = {
        travel_request_id: travelRequestId,
        origin_city: segOrigin.city,
        origin_state: segOrigin.state,
        destination_city: destName,
        destination_state: destState,
        origin_lat: segOrigin.lat,
        origin_lng: segOrigin.lng,
        destination_lat: lat,
        destination_lng: lng,
        is_full_route: false,
        route_geometry: routeGeo,
      }
      if (scheduledDate) body.scheduled_date = scheduledDate
      if (estimatedHours) body.estimated_hours = estimatedHours

      const res = await fetch("/api/route-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al crear segmento")

      if (routeGeo) {
        setSegments(prev => [...prev, {
          id: json.segment?.id,
          order,
          origin_city: segOrigin.city,
          origin_state: segOrigin.state,
          destination_city: destName,
          destination_state: destState,
          distance_km: distanceKm,
          status: "pending",
          lat: segOrigin.lat,
          lng: segOrigin.lng,
          destLat: lat,
          destLng: lng,
          route_geometry: routeGeo,
          transportista_id: user.id,
        }])
      } else {
        await loadSegments()
      }

      toast.success(`Tramo ${order} guardado (${distanceKm} km por carretera)`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setSaving(false)
    }
  }, [saving, mySegments, travelRequestId, originCity, originState, destState, originCoord, scheduledDate, estimatedHours])

  async function updateSegmentStatus(segmentId: string, newStatus: string) {
    const res = await fetch(`/api/route-segments/${segmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      const j = await res.json()
      throw new Error(j.error || "Error")
    }
    await loadSegments()
  }

  function handleStartSegment(segmentId?: string) {
    if (!segmentId) return
    updateSegmentStatus(segmentId, "in_progress")
    toast.success("Segmento iniciado")
  }

  async function handleCompleteSegment(segmentId?: string) {
    if (!segmentId) return
    try {
      await updateSegmentStatus(segmentId, "completed")
      toast.success("Segmento completado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    }
  }

  async function handleCancelSegment(segmentId?: string) {
    if (!segmentId) return
    setCancelling(true)
    try {
      await updateSegmentStatus(segmentId, "cancelled")
      toast.success("Ruta cancelada — la solicitud vuelve a estar disponible")
      onComplete()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setCancelling(false)
    }
  }

  async function completeAll() {
    try {
      const incomplete = mySegments.filter(s => s.status !== "completed")
      for (const s of incomplete) {
        if (s.id) await updateSegmentStatus(s.id, s.status === "pending" ? "in_progress" : s.status)
      }
      for (const s of incomplete) {
        if (s.id) await updateSegmentStatus(s.id, "completed")
      }
      toast.success("Ruta completada — la familia ha sido notificada")
      onComplete()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    }
  }

  const canCompleteAll = mySegments.length > 0 && mySegments.some(s => s.status === "in_progress" || s.status === "pending")
  const canCancel = mySegments.some(s => s.status === "pending" || s.status === "in_progress")

  return (
    <div className="space-y-4">
      {otherSegments.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-medium mb-1 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            Progreso de la ruta ({coveredByOthers + mySegments.filter(s => s.status !== "cancelled").length}/{totalSegmentsNeeded} tramos cubiertos)
          </p>
          <div className="space-y-1">
            {otherSegments.filter(s => s.status !== "cancelled").map((s) => (
              <p key={s.id} className="text-xs text-muted-foreground">
                {s.origin_city} → {s.destination_city}: {s.transportista_name || "Otro transportista"}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapWithNoSSR
          originCoord={originCoord ? [originCoord.lat, originCoord.lng] : null}
          destCoord={destCoord ? [destCoord.lat, destCoord.lng] : null}
          segments={mySegments}
          onClick={handleMapClick}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Haz clic en el mapa para agregar un tramo intermedio
        </p>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => {
                const last = mySegments.filter(s => s.status !== "completed").pop()
                if (last?.id) handleCancelSegment(last.id)
              }}
              disabled={cancelling}
            >
              {cancelling ? "Cancelando..." : (
                <><XCircle className="h-4 w-4 mr-1" />Cancelar ruta</>
              )}
            </Button>
          )}
          {canCompleteAll && (
            <Button onClick={completeAll} variant="default">
              Finalizar ruta
            </Button>
          )}
        </div>
      </div>

      {mySegments.length > 0 && (
        <div className="space-y-2">
          <hr className="border-t" />
          <p className="font-medium text-sm">Tus tramos planificados</p>
          {mySegments.map((seg, i) => (
            <Card key={seg.id || i}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Tramo {seg.order}: {seg.origin_city} → {seg.destination_city}
                  </p>
                  <p className="text-xs text-muted-foreground">{seg.distance_km} km</p>
                </div>
                <div className="flex gap-2">
                  {seg.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStartSegment(seg.id)}>
                        ▶ Iniciar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancelSegment(seg.id)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                  {seg.status === "in_progress" && (
                    <>
                      <Button size="sm" variant="default" onClick={() => handleCompleteSegment(seg.id)}>
                        ✅ Completar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancelSegment(seg.id)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                  {seg.status === "completed" && (
                    <span className="text-xs text-green-600 font-medium">Completado</span>
                  )}
                  {seg.status === "cancelled" && (
                    <span className="text-xs text-muted-foreground font-medium">Cancelado</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground">
            Total: {mySegments.filter(s => s.status !== "cancelled").reduce((sum, s) => sum + s.distance_km, 0).toFixed(0)} km
          </p>
        </div>
      )}
    </div>
  )
}
