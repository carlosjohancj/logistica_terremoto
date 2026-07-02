"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"

export type ListItem = {
  id: string
  type: "travel" | "transport" | "housing"
  title: string
  lat: number
  lng: number
  destLat?: number
  destLng?: number
  description: string
}

type MapViewProps = {
  items: ListItem[]
  center?: [number, number]
  zoom?: number
}

const markerSize = 28
const destMarkerSize = 20

const originColors: Record<string, string> = {
  travel: "#6B8F71",
  transport: "#A0845C",
  housing: "#4A7C59",
}

const destColors: Record<string, string> = {
  travel: "#4A7C59",
  transport: "#6B8F71",
  housing: "#3D6B47",
}

const routeColors: Record<string, string> = {
  travel: "#6B8F71",
  transport: "#A0845C",
  housing: "#4A7C59",
}

function createOriginIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${markerSize}px;height:${markerSize}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer"></div>`,
    iconSize: [markerSize, markerSize],
    iconAnchor: [markerSize / 2, markerSize / 2],
    popupAnchor: [0, -markerSize / 2],
  })
}

function createDestIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${destMarkerSize}px;height:${destMarkerSize}px;border-radius:50%;background:white;border:3px solid ${color};box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer"></div>`,
    iconSize: [destMarkerSize, destMarkerSize],
    iconAnchor: [destMarkerSize / 2, destMarkerSize / 2],
    popupAnchor: [0, -destMarkerSize / 2],
  })
}

const originIcons: Record<string, L.DivIcon> = {
  travel: createOriginIcon(originColors.travel),
  transport: createOriginIcon(originColors.transport),
  housing: createOriginIcon(originColors.housing),
}

const destIcons: Record<string, L.DivIcon> = {
  travel: createDestIcon(destColors.travel),
  transport: createDestIcon(destColors.transport),
  housing: createDestIcon(destColors.housing),
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
          <div key={item.id}>
            {item.destLat !== undefined && item.destLng !== undefined && (
              <Polyline
                positions={[
                  [item.lat, item.lng],
                  [item.destLat, item.destLng],
                ]}
                color={routeColors[item.type]}
                weight={2}
                opacity={0.5}
                dashArray="8 6"
              />
            )}
            <Marker
              position={[item.lat, item.lng]}
              icon={originIcons[item.type]}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="text-primary">{item.title}</strong>
                  <p className="text-muted-foreground mt-1">{item.description}</p>
                </div>
              </Popup>
            </Marker>
            {item.destLat !== undefined && item.destLng !== undefined && (
              <Marker
                position={[item.destLat, item.destLng]}
                icon={destIcons[item.type]}
              >
                <Popup>
                  <div className="text-sm">
                    <strong className="text-primary">Destino</strong>
                    <p className="text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </div>
        ))}
      </MapContainer>
    </div>
  )
}
