import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { data, error } = await supabase
      .from("transportista_territories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ territories: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { center_lat, center_lng, radius_km, label } = await request.json()

    if (center_lat === undefined || center_lng === undefined || radius_km === undefined) {
      return NextResponse.json({ error: "Missing required fields: center_lat, center_lng, radius_km" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("transportista_territories")
      .insert({
        user_id: user.id,
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
