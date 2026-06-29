"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

export type ListItem = {
  id: string
  type: "travel" | "transport" | "housing"
  title: string
  lat: number
  lng: number
  description: string
}

type MapViewProps = {
  items: ListItem[]
  center?: [number, number]
  zoom?: number
}

const defaultIcon = L.divIcon({
  className: "rounded-full border-2 border-white shadow-md",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#CC5A3A;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
})

const typeIcons: Record<string, L.DivIcon> = {
  travel: L.divIcon({
    className: "rounded-full border-2 border-white shadow-md",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:#CC5A3A;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  }),
  transport: L.divIcon({
    className: "rounded-full border-2 border-white shadow-md",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:#E8B84B;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  }),
  housing: L.divIcon({
    className: "rounded-full border-2 border-white shadow-md",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:#2D8A4E;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  }),
}

export function MapView({ items, center = [9.5, -66.5], zoom = 6 }: MapViewProps) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={typeIcons[item.type] ?? defaultIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-primary">{item.title}</strong>
                <p className="text-muted-foreground mt-1">{item.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
