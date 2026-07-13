import { NextResponse } from "next/server"
import { getSupabase, getServiceSupabase, TABLES } from "@/types/supabase"
import { getServerSupabase } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const helpType = searchParams.get("help_type")
    const state = searchParams.get("state")
    const status = searchParams.get("status") || "open"

    const supabase = getSupabase()
    let query = supabase
      .from(TABLES.FAMILY_AID_REQUESTS)
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (helpType) {
      query = query.eq("help_type", helpType)
    }
    if (state) {
      query = query.eq("location_state", state)
    }

    const { data, error } = await query as never as { data: unknown[] | null; error: unknown }

    if (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    return NextResponse.json({ requests: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, story, amount_needed, help_type, location_state, location_city } = body

    if (!title || !help_type) {
      return NextResponse.json({ error: "Missing required fields: title, help_type" }, { status: 400 })
    }

    const service = getServiceSupabase()
    const { data, error } = await service
      .from(TABLES.FAMILY_AID_REQUESTS)
      .insert({
        user_id: user.id,
        title,
        description: description || "",
        story: story || "",
        amount_needed: amount_needed ? Number(amount_needed) : null,
        help_type,
        location_state: location_state || "",
        location_city: location_city || "",
        status: "open",
      } as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
