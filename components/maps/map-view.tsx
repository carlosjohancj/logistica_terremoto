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

const markerSize = 28

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${markerSize}px;height:${markerSize}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer"></div>`,
    iconSize: [markerSize, markerSize],
    iconAnchor: [markerSize / 2, markerSize / 2],
    popupAnchor: [0, -markerSize / 2],
  })
}

const typeIcons: Record<string, L.DivIcon> = {
  travel: createIcon("#CC5A3A"),
  transport: createIcon("#E8B84B"),
  housing: createIcon("#2D8A4E"),
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
            icon={typeIcons[item.type]}
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
