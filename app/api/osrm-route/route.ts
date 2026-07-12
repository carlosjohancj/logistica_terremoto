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

    const res = await fetch(`${valhallaUrl}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locations: [
          { lat: fromLat, lon: fromLng, type: "break" },
          { lat: toLat, lon: toLng, type: "break" },
        ],
        costing: "auto",
        directions_options: { units: "kilometers" },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Valhalla request failed" }, { status: 502 })
    }

    const data = await res.json()
    const leg = data.trip?.legs?.[0]

    if (!leg?.shape) {
      return NextResponse.json({ error: "Valhalla returned no route" }, { status: 502 })
    }

    const decoded = polyline.decode(leg.shape, 6) as [number, number][]
    const geometry: [number, number][] = decoded.map(([lat, lng]) => [lng, lat])
    const distanceKm = Math.round((leg.summary?.length || 0) * 10) / 10

    return NextResponse.json({ geometry, distanceKm })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
