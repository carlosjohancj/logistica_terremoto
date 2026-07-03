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

    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full`

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "OSRM request failed" }, { status: 502 })
    }

    const data = await res.json()

    if (data.code !== "Ok" || !data.routes?.[0]) {
      return NextResponse.json({ error: "OSRM returned no route" }, { status: 502 })
    }

    const route = data.routes[0]
    const geometry: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]])
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10

    return NextResponse.json({ geometry, distanceKm })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
