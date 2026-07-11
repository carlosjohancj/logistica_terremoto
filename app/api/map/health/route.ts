import { NextResponse } from "next/server"

export async function GET() {
  const tileServerUrl = process.env.TILE_SERVER_URL
  const valhallaUrl = process.env.VALHALLA_URL || "http://valhalla:8002"

  const status = {
    tiles: false,
    valhalla: false,
    styleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "/api/map/styles/basic/style.json",
  }

  if (tileServerUrl) {
    try {
      const res = await fetch(`${tileServerUrl}/`, {
        signal: AbortSignal.timeout(4000),
      })
      status.tiles = res.ok
    } catch {
      status.tiles = false
    }
  }

  try {
    const res = await fetch(`${valhallaUrl}/status`, {
      signal: AbortSignal.timeout(4000),
    })
    status.valhalla = res.ok
  } catch {
    status.valhalla = false
  }

  const ok = status.tiles && status.valhalla
  return NextResponse.json(status, { status: ok ? 200 : 503 })
}
