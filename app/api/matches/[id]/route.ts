import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus || !["pending", "in_progress", "completed", "cancelled"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const service = getServiceSupabase()

    const { data: match, error: fetchError } = await service
      .from(TABLES.MATCHES)
      .select("id, travel_request_id, user_id, status")
      .eq("id", id)
      .single() as never as { data: { id: string; travel_request_id: string; user_id: string; status: string } | null; error: any }

    if (fetchError || !match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    if (match.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await service
      .from(TABLES.MATCHES)
      .update({ status: newStatus } as never)
      .eq("id", id)

    if (newStatus === "completed") {
      await service
        .from(TABLES.TRAVEL_REQUESTS)
        .update({ status: "completed" } as never)
        .eq("id", match.travel_request_id)

      await service
        .from("messages")
        .insert({
          match_id: id,
          sender_id: user.id,
          content: "🚀 Ruta completada — el transporte ha llegado a su destino.",
        } as never)
    } else if (newStatus === "in_progress") {
      await service
        .from(TABLES.TRAVEL_REQUESTS)
        .update({ status: "in_progress" } as never)
        .eq("id", match.travel_request_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
