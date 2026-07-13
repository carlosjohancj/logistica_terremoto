"use client"

import { useRef, useEffect, useCallback } from "react"
import maplibregl from "maplibre-gl"
import { OSM_RASTER_STYLE } from "@/lib/maps/constants"
import { circle } from "@turf/turf"

type SegmentDisplay = {
  order: number
  lat?: number
  lng?: number
  destLat?: number
  destLng?: number
  status: string
  origin_city: string
  destination_city: string
  route_geometry?: [number, number][]
}

type Territory = {
  id: string
  center_lat: number
  center_lng: number
  radius_km: number
  label: string | null
}

type Props = {
  originCoord: [number, number] | null
  destCoord: [number, number] | null
  segments: SegmentDisplay[]
  territories?: Territory[]
  onClick: (lat: number, lng: number) => void
}

export default function RoutePlannerMap({ originCoord, destCoord, segments, territories, onClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRefs = useRef<maplibregl.Marker[]>([])
  const territorySourceReady = useRef(false)

  const handleClick = useCallback((e: maplibregl.MapMouseEvent) => {
    onClick(e.lngLat.lat, e.lngLat.lng)
  }, [onClick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_RASTER_STYLE,
      center: originCoord ? [originCoord[1], originCoord[0]] : [-66.5, 9.5],
      zoom: 8,
    })

    map.addControl(new maplibregl.NavigationControl(), "top-right")

    map.on("load", () => {
      map.addSource("planner-territories", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      })
      map.addLayer({
        id: "planner-territories-fill",
        type: "fill",
        source: "planner-territories",
        paint: { "fill-color": "#10B981", "fill-opacity": 0.1 },
      })
      map.addLayer({
        id: "planner-territories-outline",
        type: "line",
        source: "planner-territories",
        paint: { "line-color": "#10B981", "line-width": 2, "line-opacity": 0.6, "line-dasharray": [3, 3] },
      })
      territorySourceReady.current = true
      updateTerritoryCircles(map, territories || [])
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      territorySourceReady.current = false
    }
  }, [])

  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    if (territorySourceReady.current) {
      updateTerritoryCircles(m, territories || [])
    }
  }, [territories])

  useEffect(() => {
    const m = mapRef.current
    if (!m) return

    function render(map: maplibregl.Map) {
      markerRefs.current.forEach((mk) => mk.remove())
      markerRefs.current = []

      if (originCoord) {
        const el = document.createElement("div")
        el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:#6B8F71;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([originCoord[1], originCoord[0]])
          .addTo(map)
        markerRefs.current.push(marker)
      }

      if (destCoord) {
        const el = document.createElement("div")
        el.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:white;border:3px solid #4A7C59;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([destCoord[1], destCoord[0]])
          .addTo(map)
        markerRefs.current.push(marker)
      }

      updateSegments(map, segments)
    }

    if (m.isStyleLoaded()) {
      render(m)
    } else {
      m.once("style.load", () => render(m))
    }
  }, [originCoord, destCoord, segments])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.on("click", handleClick)
    return () => { map.off("click", handleClick) }
  }, [handleClick])

  return (
    <div className="h-full w-full" ref={containerRef} />
  )
}

function updateTerritoryCircles(map: maplibregl.Map, territories: Territory[]) {
  const features: GeoJSON.Feature[] = territories.map((t) =>
    circle([t.center_lng, t.center_lat], t.radius_km, { steps: 64, units: "kilometers" })
  )
  const src = map.getSource("planner-territories") as maplibregl.GeoJSONSource | undefined
  if (src) {
    src.setData({ type: "FeatureCollection", features })
  }
}

function updateSegments(map: maplibregl.Map, segments: SegmentDisplay[]) {
  const sourceId = "planner-segments"
  const features: GeoJSON.Feature[] = []

  segments.forEach((seg) => {
    let coords: number[][]
    if (seg.route_geometry && seg.route_geometry.length > 1) {
      coords = seg.route_geometry
    } else if (seg.lat !== undefined && seg.lng !== undefined && seg.destLat !== undefined && seg.destLng !== undefined) {
      coords = [[seg.lng, seg.lat], [seg.destLng, seg.destLat]]
    } else {
      return
    }

    features.push({
      type: "Feature",
      properties: { status: seg.status },
      geometry: { type: "LineString", coordinates: coords },
    })
  })

  if (map.getSource(sourceId)) {
    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features,
    })
    return
  }

  if (features.length === 0) return

  map.addSource(sourceId, {
    type: "geojson",
    data: { type: "FeatureCollection", features },
  })

  map.addLayer({
    id: sourceId,
    type: "line",
    source: sourceId,
    filter: ["!=", ["get", "status"], "completed"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#3B82F6", "line-width": 6, "line-opacity": 0.85 },
  })

  map.addLayer({
    id: "planner-completed",
    type: "line",
    source: sourceId,
    filter: ["==", ["get", "status"], "completed"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#10B981", "line-width": 5, "line-opacity": 0.7 },
  })
}
