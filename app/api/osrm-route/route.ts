import { NextResponse } from "next/server"

type RouteBody = {
  fromLng: number
  fromLat: number
  toLng: number
  toLat: number
}

export async function POST(request: Request) {
  try {
    const { fromLng, fromLat, toLng, toLat } = await request.json() as RouteBody

    if (fromLng === undefined || fromLat === undefined || toLng === undefined || toLat === undefined) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
    }

    const valhallaUrl = process.env.VALHALLA_URL || "http://valhalla:8002"

    const body = {
      locations: [
        { lat: fromLat, lon: fromLng, type: "break" },
        { lat: toLat, lon: toLng, type: "break" },
      ],
      costing: "auto",
      directions_options: { units: "kilometers" },
      format: "geojson",
    }

    const res = await fetch(`${valhallaUrl}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Valhalla request failed" }, { status: 502 })
    }

    const data = await res.json()

    const feature = data.features?.[0]
    if (!feature?.geometry?.coordinates) {
      return NextResponse.json({ error: "Valhalla returned no route" }, { status: 502 })
    }

    const geometry: [number, number][] = feature.geometry.coordinates.map(
      (c: number[]) => [c[0], c[1]]
    )

    const distanceKm = Math.round((feature.properties?.summary?.length || 0) * 10) / 10

    return NextResponse.json({ geometry, distanceKm })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
