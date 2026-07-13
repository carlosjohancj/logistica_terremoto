import { NextResponse } from "next/server"
import polyline from "@mapbox/polyline"

type RouteBody = {
  fromLng: number
  fromLat: number
  toLng: number
  toLat: number
}

export async function POST(request: Request) {
  try {
    const { fromLng, fromLat, toLng, toLat } = await request.json() as RouteBody

    if ([fromLng, fromLat, toLng, toLat].some(v => v === undefined)) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
    }

    const valhallaUrl = process.env.VALHALLA_URL || "http://valhalla:8002"
    console.log("[osrm-route] calling Valhalla at", valhallaUrl)
    console.log("[osrm-route] from", fromLat, fromLng, "to", toLat, toLng)

    const res = await fetch(`${valhallaUrl}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "route_request",
        locations: [
          { lat: fromLat, lon: fromLng, type: "break" },
          { lat: toLat, lon: toLng, type: "break" },
        ],
        costing: "auto",
        directions_options: { units: "kilometers", language: "en-US" },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("[osrm-route] Valhalla responded", res.status, body.slice(0, 500))
      return NextResponse.json({ error: `Valhalla request failed: ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const leg = data.trip?.legs?.[0]

    if (!leg?.shape) {
      console.error("[osrm-route] Valhalla returned no shape in trip", JSON.stringify(data.trip).slice(0, 500))
      return NextResponse.json({ error: "Valhalla returned no route" }, { status: 502 })
    }

    const decoded = polyline.decode(leg.shape, 6) as [number, number][]
    const geometry: [number, number][] = decoded.map(([lat, lng]) => [lng, lat])
    const distanceKm = Math.round((leg.summary?.length || 0) * 10) / 10

    console.log("[osrm-route] success, distance", distanceKm, "km,", geometry.length, "points")
    return NextResponse.json({ geometry, distanceKm })
  } catch (err) {
    console.error("[osrm-route] exception:", err)
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
