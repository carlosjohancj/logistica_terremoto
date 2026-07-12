import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params

  const tileServerUrl = process.env.TILE_SERVER_URL
  if (!tileServerUrl) {
    return new NextResponse(null, { status: 404 })
  }

  const mapPath = path.join("/")
  const url = `${tileServerUrl}/${mapPath}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })

    if (!res.ok) {
      return new NextResponse(null, { status: res.status })
    }

    const contentType = res.headers.get("Content-Type") || "application/octet-stream"
    const cacheControl = "public, max-age=3600, s-maxage=86400"

    if (contentType.includes("json")) {
      const text = await res.text()
      let json = JSON.parse(text)

      json = rewriteStyleUrls(json, tileServerUrl)

      return NextResponse.json(json, {
        headers: { "Cache-Control": cacheControl },
      })
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}

function rewriteStyleUrls(style: Record<string, unknown>, baseUrl: string): Record<string, unknown> {
  const proxyBase = "/api/map"

  function rewrite(url: string): string {
    if (url.startsWith(baseUrl)) return url.replace(baseUrl, proxyBase)
    if (url.startsWith("/")) return `${proxyBase}${url}`
    if (isExternalMapAsset(url)) {
      try {
        return `${proxyBase}${new URL(url).pathname}`
      } catch {
        return url
      }
    }
    return url
  }

  if (style.sources && typeof style.sources === "object") {
    for (const source of Object.values(style.sources as Record<string, unknown>)) {
      if (source && typeof source === "object") {
        const src = source as Record<string, unknown>
        if (typeof src.url === "string") src.url = rewrite(src.url)
        if (Array.isArray(src.tiles)) {
          src.tiles = (src.tiles as string[]).map(rewrite)
        }
        if (typeof src.data === "string") src.data = rewrite(src.data)
      }
    }
  }

  if (Array.isArray(style.tiles)) {
    style.tiles = (style.tiles as string[]).map(rewrite)
  }
  if (typeof style.data === "string") {
    style.data = rewrite(style.data)
  }

  if (typeof style.glyphs === "string") style.glyphs = rewrite(style.glyphs)
  if (typeof style.sprite === "string") style.sprite = rewrite(style.sprite)

  return style
}

function isExternalMapAsset(url: string): boolean {
  return (
    url.includes("openfreemap.org") ||
    url.includes("openmaptiles.org") ||
    url.includes("maptiler.com") ||
    url.includes("maplibre.org")
  )
}
