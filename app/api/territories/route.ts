import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    if (!userId) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })

    const service = getServiceSupabase()
    const { data, error } = await service
      .from(TABLES.TRANSPORTISTA_TERRITORIES)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ territories: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { center_lat, center_lng, radius_km, label, user_id } = await request.json()

    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    if (center_lat === undefined || center_lng === undefined || radius_km === undefined) {
      return NextResponse.json({ error: "Missing required fields: center_lat, center_lng, radius_km" }, { status: 400 })
    }

    const service = getServiceSupabase()
    const { data, error } = await service
      .from(TABLES.TRANSPORTISTA_TERRITORIES)
      .insert({
        user_id,
        center_lat,
        center_lng,
        radius_km,
        label: label || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ territory: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
