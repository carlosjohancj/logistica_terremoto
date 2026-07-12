import { NextResponse } from "next/server"

const STYLE_URL = "https://cdn.jsdelivr.net/npm/maplibre-gl-styles@latest/styles/osm-bright/style.json"

export async function GET() {
  const res = await fetch(STYLE_URL)
  if (!res.ok) return new NextResponse(null, { status: 502 })

  const style = await res.json()

  for (const src of Object.values(style.sources as Record<string, unknown>)) {
    const s = src as Record<string, unknown>
    if (Array.isArray(s.tiles)) {
      s.tiles = (s.tiles as string[]).map((t: string) =>
        t.replace(/https?:\/\/[^/]+\/data\/v3/, "/api/map/v3"),
      )
    }
  }

  return NextResponse.json(style, {
    headers: { "Cache-Control": "public, max-age=86400" },
  })
}
