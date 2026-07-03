"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { getSupabase } from "@/lib/supabase"
import { getCityCoord } from "@/lib/estados"

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
}

type Props = {
  travelRequestId: string
  originCity: string
  originState: string
  destCity: string
  destState: string
  onComplete: () => void
}

async function fetchOSRM(fromLng: number, fromLat: number, toLng: number, toLat: number): Promise<{ geometry: [number, number][]; distanceKm: number } | null> {
  try {
    const res = await fetch("/api/osrm-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromLng, fromLat, toLng, toLat }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null
    return { geometry: data.geometry, distanceKm: data.distanceKm }
  } catch {
    return null
  }
}

export default function RoutePlanner({ travelRequestId, originCity, originState, destCity, destState, onComplete }: Props) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [saving, setSaving] = useState(false)
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
    loadSegments()
  }, [travelRequestId])

  async function loadSegments() {
    try {
      const res = await fetch(`/api/route-segments?travel_request_id=${travelRequestId}`)
      const json = await res.json()
      if (json.segments) {
        setSegments(json.segments.map((s: any) => {
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
          }
        }))
      }
    } catch {
      // ignore
    }
  }

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (saving) return
    setSaving(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const prevSegment = segments[segments.length - 1]
      const segOrigin = prevSegment
        ? { city: prevSegment.destination_city, state: prevSegment.destination_state, lat: prevSegment.destLat!, lng: prevSegment.destLng! }
        : { city: originCity, state: originState, lat: originCoord?.lat || 0, lng: originCoord?.lng || 0 }

      const destName = `Punto ${segments.length + 1}`
      const order = segments.length + 1

      let distanceKm: number
      let routeGeo: [number, number][] | null = null

      const osrm = await fetchOSRM(segOrigin.lng, segOrigin.lat, lng, lat)
      if (osrm) {
        distanceKm = osrm.distanceKm
        routeGeo = osrm.geometry
      } else {
        const { distance } = await import("@turf/turf")
        distanceKm = Math.round(distance([segOrigin.lng, segOrigin.lat], [lng, lat], { units: "kilometers" }) * 10) / 10
      }

      const res = await fetch("/api/route-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
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
  }, [saving, segments, travelRequestId, originCity, originState, destState, originCoord])

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
      const seg = segments.find(s => s.id === segmentId)
      if (seg) {
        seg.status = "completed"
        const allDone = segments.every(s => s.status === "completed")
        if (allDone) {
          toast.success("Ruta completada — la familia ha sido notificada")
          onComplete()
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    }
  }

  async function completeAll() {
    try {
      const incomplete = segments.filter(s => s.status !== "completed")
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

  const canCompleteAll = segments.length > 0 && segments.some(s => s.status === "in_progress" || s.status === "pending")

  return (
    <div className="space-y-4">
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapWithNoSSR
          originCoord={originCoord ? [originCoord.lat, originCoord.lng] : null}
          destCoord={destCoord ? [destCoord.lat, destCoord.lng] : null}
          segments={segments}
          onClick={handleMapClick}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Haz clic en el mapa para agregar un tramo intermedio
        </p>
        {canCompleteAll && (
          <Button onClick={completeAll} variant="default">
            Finalizar ruta
          </Button>
        )}
      </div>

      {segments.length > 0 && (
        <div className="space-y-2">
          <hr className="border-t" />
          <p className="font-medium text-sm">Tramos planificados</p>
          {segments.map((seg, i) => (
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
                    <Button size="sm" variant="outline" onClick={() => handleStartSegment(seg.id)}>
                      ▶ Iniciar
                    </Button>
                  )}
                  {seg.status === "in_progress" && (
                    <Button size="sm" variant="default" onClick={() => handleCompleteSegment(seg.id)}>
                      ✅ Completar
                    </Button>
                  )}
                  {seg.status === "completed" && (
                    <span className="text-xs text-green-600 font-medium">Completado</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground">
            Total: {segments.reduce((sum, s) => sum + s.distance_km, 0).toFixed(0)} km
          </p>
        </div>
      )}
    </div>
  )
}
