"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import maplibregl from "maplibre-gl"
import { OSM_RASTER_STYLE } from "@/lib/maps/constants"
import { getSupabase } from "@/lib/supabase"
import { circle, distance } from "@turf/turf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { MapPin, Trash2, Save, Crosshair, Navigation } from "lucide-react"

type Territory = {
  id: string
  center_lat: number
  center_lng: number
  radius_km: number
  label: string | null
}

export default function TerritoryManager() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const drawingRef = useRef(false)
  const centerRef = useRef<{ lat: number; lng: number } | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const sourcesReadyRef = useRef(false)
  const selectingRef = useRef(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [centerLat, setCenterLat] = useState<number | null>(null)
  const [centerLng, setCenterLng] = useState<number | null>(null)
  const [radiusKm, setRadiusKm] = useState(10)
  const [label, setLabel] = useState("")
  const [saving, setSaving] = useState(false)

  const toggleSelecting = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const next = !selectingRef.current
    selectingRef.current = next
    setSelecting(next)
    if (next) {
      map.dragPan.disable()
      map.getCanvas().style.cursor = "crosshair"
    } else {
      map.dragPan.enable()
      map.getCanvas().style.cursor = ""
      drawingRef.current = false
      setDrawing(false)
    }
  }, [])

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (userId) loadTerritories()
  }, [userId])

  async function loadTerritories() {
    if (!userId) return
    try {
      const res = await fetch(`/api/territories?user_id=${userId}`)
      const json = await res.json()
      setTerritories(json.territories || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  function clearDrawingCircle(map: maplibregl.Map) {
    const src = map.getSource("drawing-circle") as maplibregl.GeoJSONSource | undefined
    if (src) src.setData({ type: "FeatureCollection", features: [] })
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }

  function updateDrawingCircle(map: maplibregl.Map, lng: number, lat: number, radius: number) {
    if (!sourcesReadyRef.current) return
    if (markerRef.current) markerRef.current.remove()
    const el = document.createElement("div")
    el.innerHTML = `<div style="width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map)
    if (radius <= 0) {
      const src = map.getSource("drawing-circle") as maplibregl.GeoJSONSource | undefined
      if (src) src.setData({ type: "FeatureCollection", features: [] })
      return
    }
    const feature = circle([lng, lat], radius, { steps: 64, units: "kilometers" })
    const src = map.getSource("drawing-circle") as maplibregl.GeoJSONSource | undefined
    if (src) src.setData({ type: "FeatureCollection", features: [feature] })
  }

  function updateSavedTerritories(map: maplibregl.Map) {
    if (!sourcesReadyRef.current) return
    const features: GeoJSON.Feature[] = territories.map((t) =>
      circle([t.center_lng, t.center_lat], t.radius_km, { steps: 64, units: "kilometers" })
    )
    const src = map.getSource("saved-territories") as maplibregl.GeoJSONSource | undefined
    if (src) src.setData({ type: "FeatureCollection", features })
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_RASTER_STYLE,
      center: [-66.5, 9.5],
      zoom: 6,
    })

    map.addControl(new maplibregl.NavigationControl(), "top-right")

    map.on("load", () => {
      map.addSource("drawing-circle", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      })
      map.addLayer({
        id: "drawing-circle-fill",
        type: "fill",
        source: "drawing-circle",
        paint: { "fill-color": "#3B82F6", "fill-opacity": 0.15 },
      })
      map.addLayer({
        id: "drawing-circle-outline",
        type: "line",
        source: "drawing-circle",
        paint: {
          "line-color": "#3B82F6",
          "line-width": 2,
          "line-opacity": 0.8,
          "line-dasharray": [3, 3],
        },
      })
      map.addSource("saved-territories", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      })
      map.addLayer({
        id: "saved-territories-fill",
        type: "fill",
        source: "saved-territories",
        paint: { "fill-color": "#10B981", "fill-opacity": 0.12 },
      })
      map.addLayer({
        id: "saved-territories-outline",
        type: "line",
        source: "saved-territories",
        paint: {
          "line-color": "#10B981",
          "line-width": 2,
          "line-opacity": 0.7,
        },
      })
      sourcesReadyRef.current = true
      updateSavedTerritories(map)
    })

    map.on("mousedown", (e) => {
      if (e.originalEvent.button !== 0) return
      if (!selectingRef.current) return
      drawingRef.current = true
      centerRef.current = { lat: e.lngLat.lat, lng: e.lngLat.lng }
      setCenterLat(e.lngLat.lat)
      setCenterLng(e.lngLat.lng)
      setRadiusKm(0)
      setDrawing(true)
    })

    map.on("mousemove", (e) => {
      if (!drawingRef.current || !centerRef.current) return
      const dist = distance(
        [centerRef.current.lng, centerRef.current.lat],
        [e.lngLat.lng, e.lngLat.lat],
        { units: "kilometers" },
      )
      const rounded = Math.round(dist * 10) / 10
      setRadiusKm(rounded)
      updateDrawingCircle(map, centerRef.current.lng, centerRef.current.lat, dist)
    })

    function onWindowMouseUp() {
      if (drawingRef.current) {
        drawingRef.current = false
        setDrawing(false)
      }
    }
    window.addEventListener("mouseup", onWindowMouseUp)
    map.getCanvas().addEventListener("contextmenu", (e) => e.preventDefault())

    mapRef.current = map

    return () => {
      window.removeEventListener("mouseup", onWindowMouseUp)
      map.remove()
      mapRef.current = null
      sourcesReadyRef.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (map) updateSavedTerritories(map)
  }, [territories])

  useEffect(() => {
    const map = mapRef.current
    if (map && centerLat !== null && centerLng !== null && radiusKm > 0 && sourcesReadyRef.current) {
      updateDrawingCircle(map, centerLng, centerLat, radiusKm)
    }
  }, [radiusKm])

  async function handleSave() {
    if (!userId) { toast.error("Debes iniciar sesión"); return }
    if (centerLat === null || centerLng === null || radiusKm < 1) {
      toast.error("Dibuja un círculo en el mapa primero")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/territories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          center_lat: centerLat,
          center_lng: centerLng,
          radius_km: radiusKm,
          label: label.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al guardar")
      toast.success("Territorio guardado")
      setCenterLat(null)
      setCenterLng(null)
      setRadiusKm(10)
      setLabel("")
      const map = mapRef.current
      if (map) clearDrawingCircle(map)
      await loadTerritories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return
    try {
      const res = await fetch(`/api/territories/${id}?user_id=${userId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error")
      toast.success("Territorio eliminado")
      await loadTerritories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] rounded-lg overflow-hidden border">
        <div ref={containerRef} className="h-full w-full" />
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          <Button
            size="sm"
            variant={selecting ? "default" : "outline"}
            onClick={toggleSelecting}
            className="shadow"
          >
            {selecting ? (
              <><Navigation className="h-4 w-4 mr-1" />Navegar</>
            ) : (
              <><Crosshair className="h-4 w-4 mr-1" />Seleccionar zona</>
            )}
          </Button>
        </div>
        {drawing && (
          <div className="absolute top-12 left-2 z-10 rounded-md bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow">
            Arrastra para definir el radio
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-muted-foreground">Radio</label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={500}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="h-8"
            />
            <span className="text-xs text-muted-foreground">km</span>
          </div>
        </div>
        <div className="space-y-1 flex-[2] min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Nombre de la zona</label>
          <Input
            placeholder="ej: Zona Centro, Occidente..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-8"
          />
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || radiusKm < 1}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Guardando..." : "Guardar zona"}
        </Button>
      </div>

      {territories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Tus zonas guardadas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {territories.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      <MapPin className="h-3.5 w-3.5 inline mr-1 text-primary" />
                      {t.label || `Zona (${t.radius_km} km)`}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.radius_km} km de radio</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
