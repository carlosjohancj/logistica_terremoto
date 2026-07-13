"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getSupabase } from "@/types/supabase"
import { getCityCoord } from "@/lib/estados"
import { fetchRoute } from "@/lib/maps/fetch-route"
import { nearestPointOnLine, lineString } from "@turf/turf"
import { Loader2, MapPin, Flag, Users, Phone, Package, AlertTriangle, XCircle, CheckCircle, Route, ChevronDown } from "lucide-react"

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

type Territory = {
  id: string
  center_lat: number
  center_lng: number
  radius_km: number
  label: string | null
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
  requesterName?: string
  requesterPhone?: string
  peopleToMove?: number
  notes?: string
  needsCargo?: boolean
  cargoDescription?: string
}

export default function RoutePlanner({
  travelRequestId, originCity, originState, destCity, destState,
  onComplete, scheduledDate, estimatedHours,
  requesterName, requesterPhone, peopleToMove, notes, needsCargo, cargoDescription,
}: Props) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [allSegments, setAllSegments] = useState<Segment[]>([])
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [originCoord, setOriginCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [destCoord, setDestCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [territories, setTerritories] = useState<Territory[]>([])
  const [panelOpen, setPanelOpen] = useState(true)
  const [fullRouteGeometry, setFullRouteGeometry] = useState<[number, number][] | null>(null)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

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
    if (currentUserId) {
      loadSegments()
      loadTerritories()
    }
  }, [travelRequestId, currentUserId])

  useEffect(() => {
    if (!originCoord || !destCoord) return
    setFullRouteGeometry(null)
    fetchRoute(originCoord.lng, originCoord.lat, destCoord.lng, destCoord.lat)
      .then((result) => setFullRouteGeometry(result?.geometry ?? null))
  }, [originCoord, destCoord])

  async function loadTerritories() {
    try {
      const res = await fetch(`/api/territories?user_id=${currentUserId}`)
      const json = await res.json()
      setTerritories(json.territories || [])
    } catch { /* ignore */ }
  }

  async function loadSegments() {
    try {
      const res = await fetch(`/api/route-segments?travel_request_id=${travelRequestId}&include_profile=true`)
      const json = await res.json()
      const parsed = (json.segments || []).map((s: any) => {
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
    } catch { /* ignore */ }
  }

  const mySegments = segments.filter(s => s.transportista_id === currentUserId)
  const otherSegments = allSegments.filter(s => s.transportista_id && s.transportista_id !== currentUserId)
  const totalKm = mySegments.filter(s => s.status !== "cancelled").reduce((sum, s) => sum + s.distance_km, 0)
  const completedKm = mySegments.filter(s => s.status === "completed").reduce((sum, s) => sum + s.distance_km, 0)
  const activeCount = mySegments.filter(s => s.status !== "cancelled").length

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (saving) return
    if (!currentUserId) return
    setSaving(true)
    try {
      const prevSegment = mySegments[mySegments.length - 1]
      const segOrigin = prevSegment
        ? { city: prevSegment.destination_city, state: prevSegment.destination_state, lat: prevSegment.destLat!, lng: prevSegment.destLng! }
        : { city: originCity, state: originState, lat: originCoord?.lat || 0, lng: originCoord?.lng || 0 }

      // Snap click to nearest point on full route
      let snapLng = lng
      let snapLat = lat
      if (fullRouteGeometry && fullRouteGeometry.length > 1) {
        try {
          const turfLine = lineString(fullRouteGeometry)
          const snapped = nearestPointOnLine(turfLine, [lng, lat])
          snapLng = snapped.geometry.coordinates[0]
          snapLat = snapped.geometry.coordinates[1]
        } catch {}
      }

      const destName = `Punto ${mySegments.length + 1}`
      const order = mySegments.length + 1

      let distanceKm: number
      let routeGeo: [number, number][] | null = null

      const valhalla = await fetchRoute(segOrigin.lng, segOrigin.lat, snapLng, snapLat)
      if (valhalla) {
        distanceKm = valhalla.distanceKm
        routeGeo = valhalla.geometry
      } else {
        const { distance } = await import("@turf/turf")
        distanceKm = Math.round(distance([segOrigin.lng, segOrigin.lat], [snapLng, snapLat], { units: "kilometers" }) * 10) / 10
      }

      const body: Record<string, unknown> = {
        user_id: currentUserId,
        travel_request_id: travelRequestId,
        origin_city: segOrigin.city,
        origin_state: segOrigin.state,
        destination_city: destName,
        destination_state: destState,
        origin_lat: segOrigin.lat,
        origin_lng: segOrigin.lng,
        destination_lat: snapLat,
        destination_lng: snapLng,
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
          destLat: snapLat,
          destLng: snapLng,
          route_geometry: routeGeo,
          transportista_id: currentUserId,
        }])
      } else {
        await loadSegments()
      }

      toast.success(`Tramo ${order} guardado (${distanceKm} km)`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setSaving(false)
    }
  }, [saving, mySegments, travelRequestId, originCity, originState, destState, originCoord, currentUserId, scheduledDate, estimatedHours, fullRouteGeometry])

  async function updateSegmentStatus(segmentId: string, newStatus: string) {
    const res = await fetch(`/api/route-segments/${segmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, user_id: currentUserId }),
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

  async function handleCompleteAll() {
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

  const handleSelectSegment = useCallback((id: string | null) => {
    setSelectedSegmentId(id)
  }, [])

  const canCompleteAll = mySegments.length > 0 && mySegments.some(s => s.status === "in_progress" || s.status === "pending")
  const canCancel = mySegments.some(s => s.status === "pending" || s.status === "in_progress")
  const progressPct = totalKm > 0 ? Math.round((completedKm / totalKm) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Multi-transportista progress */}
      {otherSegments.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-medium flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            Progreso de la ruta ({activeCount + otherSegments.filter(s => s.status !== "cancelled").length} tramos cubiertos)
          </p>
        </div>
      )}

      {/* Map */}
      <div className="relative h-112.5 rounded-lg overflow-hidden border">
        <MapWithNoSSR
          originCoord={originCoord ? [originCoord.lat, originCoord.lng] : null}
          destCoord={destCoord ? [destCoord.lat, destCoord.lng] : null}
          segments={mySegments}
          territories={territories}
          fullRouteGeometry={fullRouteGeometry ?? undefined}
          selectedSegmentId={selectedSegmentId ?? undefined}
          onClick={handleMapClick}
          onSelectSegment={handleSelectSegment}
        />

        {/* Collapsible info panel overlay */}
        {panelOpen && (
          <div className="absolute bottom-3 left-3 right-3 z-10 mx-auto max-w-md">
            <Card className="shadow-lg border-primary/10">
              <CardContent className="p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{originCity}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="truncate">{destCity}</span>
                  </div>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {peopleToMove && (
                    <Badge variant="outline" className="gap-1 font-normal text-xs">
                      <Users className="h-3 w-3" />{peopleToMove} pers.
                    </Badge>
                  )}
                  {needsCargo && (
                    <Badge variant="secondary" className="gap-1 font-normal text-xs">
                      <Package className="h-3 w-3" />{cargoDescription || "Carga"}
                    </Badge>
                  )}
                  {requesterName && (
                    <Badge variant="outline" className="gap-1 font-normal text-xs">
                      <Phone className="h-3 w-3" />{requesterName}{requesterPhone ? ` · ${requesterPhone}` : ""}
                    </Badge>
                  )}
                </div>

                {notes && (
                  <p className="text-xs text-muted-foreground">{notes}</p>
                )}

                {/* Progress bar for segments */}
                {mySegments.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{activeCount} tramo{activeCount !== 1 ? "s" : ""} · {Math.round(totalKm)} km</span>
                      <span>{progressPct}% completado</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute bottom-3 left-3 z-10 rounded-full bg-background/90 p-2 shadow backdrop-blur hover:bg-background"
          >
            <Route className="h-4 w-4 text-primary" />
          </button>
        )}

        {/* Saving overlay */}
        {saving && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40">
            <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 shadow">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Calculando ruta...</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Haz clic en el mapa para agregar un punto intermedio
        </p>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
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
            <Button size="sm" onClick={handleCompleteAll}>
              <CheckCircle className="h-4 w-4 mr-1" />Finalizar ruta
            </Button>
          )}
        </div>
      </div>

      {/* Segments list */}
      {mySegments.length > 0 && (
        <div className="space-y-2">
          <hr className="border-t" />
          <p className="text-sm font-medium flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            Tus tramos planificados
            <Badge variant="secondary" className="text-xs">{activeCount}</Badge>
          </p>

          {/* Visual progress timeline */}
          <div className="flex items-center gap-1 px-1">
            {mySegments.filter(s => s.status !== "cancelled").map((seg, i) => (
              <div key={seg.id || i} className="flex items-center gap-1 flex-1">
                <div className={`h-2 flex-1 rounded-full ${
                  seg.status === "completed" ? "bg-green-500" :
                  seg.status === "in_progress" ? "bg-blue-500 animate-pulse" :
                  "bg-muted"
                }`} />
              </div>
            ))}
          </div>

          {mySegments.map((seg, i) => (
            <Card key={seg.id || i} className={`transition-colors ${
              seg.status === "in_progress" ? "border-blue-300 bg-blue-50/30" :
              seg.status === "completed" ? "border-green-300 bg-green-50/30" :
              seg.status === "cancelled" ? "opacity-50" : ""
            }`}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {seg.order}
                    </span>
                    <p className="text-sm font-medium truncate">
                      {seg.origin_city} → {seg.destination_city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{seg.distance_km} km</span>
                    {seg.status === "pending" && <Badge variant="outline" className="text-[10px] h-4">Pendiente</Badge>}
                    {seg.status === "in_progress" && <Badge className="bg-blue-500 text-[10px] h-4">En curso</Badge>}
                    {seg.status === "completed" && <Badge className="bg-green-600 text-[10px] h-4">Completado</Badge>}
                    {seg.status === "cancelled" && <Badge variant="destructive" className="text-[10px] h-4">Cancelado</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {seg.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStartSegment(seg.id)}>
                        Iniciar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleCancelSegment(seg.id)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {seg.status === "in_progress" && (
                    <>
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleCompleteSegment(seg.id)}>
                        Completar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleCancelSegment(seg.id)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {seg.status === "completed" && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />Listo
                    </span>
                  )}
                  {seg.status === "cancelled" && (
                    <span className="text-xs text-muted-foreground">Cancelado</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
