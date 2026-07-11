export type RouteResult = {
  geometry: [number, number][]
  distanceKm: number
}

export async function fetchRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
): Promise<RouteResult | null> {
  try {
    const res = await fetch("/api/osrm-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromLng, fromLat, toLng, toLat }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error || !data.geometry?.length) return null
    return { geometry: data.geometry, distanceKm: data.distanceKm }
  } catch {
    return null
  }
}

type RoutePair = {
  id: string
  fromLng: number
  fromLat: number
  toLng: number
  toLat: number
}

/** Resuelve rutas Valhalla en lotes con límite de concurrencia. */
export async function fetchRoutesBatch(
  pairs: RoutePair[],
  concurrency = 5,
): Promise<Map<string, RouteResult>> {
  const results = new Map<string, RouteResult>()
  if (pairs.length === 0) return results

  let index = 0

  async function worker() {
    while (index < pairs.length) {
      const current = pairs[index++]
      const route = await fetchRoute(
        current.fromLng,
        current.fromLat,
        current.toLng,
        current.toLat,
      )
      if (route) results.set(current.id, route)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, pairs.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}
