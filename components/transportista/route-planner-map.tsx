"use client"

import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet"
import L from "leaflet"

const originIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#6B8F71;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:white;border:3px solid #4A7C59;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const waypointIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#A0845C;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

type SegmentDisplay = {
  order: number
  lat?: number
  lng?: number
  destLat?: number
  destLng?: number
  status: string
  origin_city: string
  destination_city: string
}

type Props = {
  originCoord: [number, number] | null
  destCoord: [number, number] | null
  segments: SegmentDisplay[]
  onClick: (lat: number, lng: number) => void
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function RoutePlannerMap({ originCoord, destCoord, segments, onClick }: Props) {
  const center: [number, number] = originCoord || [9.5, -66.5]

  const allPositions: [number, number][] = []
  if (originCoord) {
    allPositions.push(originCoord)
    segments.forEach((s) => {
      if (s.destLat !== undefined && s.destLng !== undefined) {
        allPositions.push([s.destLat, s.destLng])
      }
    })
  }
  if (destCoord && allPositions.length > 0) {
    const last = allPositions[allPositions.length - 1]
    if (last[0] !== destCoord[0] || last[1] !== destCoord[1]) {
      allPositions.push(destCoord)
    }
  }

  return (
    <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onClick} />

      {originCoord && (
        <Marker position={originCoord} icon={originIcon}>
        </Marker>
      )}

      {destCoord && (
        <Marker position={destCoord} icon={destIcon}>
        </Marker>
      )}

      {segments.map((seg) => {
        const points: [number, number][] = []
        if (seg.lat !== undefined && seg.lng !== undefined) {
          points.push([seg.lat, seg.lng])
        }
        if (seg.destLat !== undefined && seg.destLng !== undefined) {
          points.push([seg.destLat, seg.destLng])
        }
        if (points.length === 2) {
          return (
            <Polyline
              key={seg.order}
              positions={points}
              color={seg.status === "completed" ? "#6B8F71" : seg.status === "in_progress" ? "#A0845C" : "#94a3b8"}
              weight={3}
              opacity={0.7}
            />
          )
        }
        return null
      })}

      {originCoord && allPositions.length > 1 && (
        <Polyline
          positions={[allPositions[0], ...(destCoord ? [destCoord] : [])]}
          color="#6B8F71"
          weight={2}
          opacity={0.3}
          dashArray="8 6"
        />
      )}
    </MapContainer>
  )
}
