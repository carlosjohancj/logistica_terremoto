import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params

  const tileServerUrl = process.env.TILE_SERVER_URL
  if (!tileServerUrl) {
    return new NextResponse(null, { status: 404 })
  }

  const tilePath = path.join("/")
  const url = `${tileServerUrl}/${tilePath}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })

    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }

    const blob = await res.blob()

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
