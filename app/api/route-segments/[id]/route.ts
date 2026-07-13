import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status: newStatus, user_id } = body

    if (!user_id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!newStatus || !["pending", "in_progress", "completed", "cancelled"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const service = getServiceSupabase()

    const { data: segment, error: fetchError } = await service
      .from(TABLES.ROUTE_SEGMENTS)
      .select("id, match_id, travel_request_id, transportista_id, status")
      .eq("id", id)
      .eq("transportista_id", user_id)
      .single() as never as { data: { id: string; match_id: string; travel_request_id: string; transportista_id: string; status: string } | null; error: any }

    if (fetchError || !segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 })
    }

    const { error: updateError } = await service
      .from(TABLES.ROUTE_SEGMENTS)
      .update({ status: newStatus } as never)
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (newStatus === "completed") {
      const { data: allSegments } = await service
        .from(TABLES.ROUTE_SEGMENTS)
        .select("status")
        .eq("match_id", segment.match_id)

      const allCompleted = allSegments?.every((s: { status: string }) => s.status === "completed") ?? false

      if (allCompleted) {
        await Promise.all([
          service.from(TABLES.MATCHES).update({ status: "completed" } as never).eq("id", segment.match_id),
          service.from(TABLES.TRAVEL_REQUESTS).update({ status: "completed" } as never).eq("id", segment.travel_request_id),
          service.from("messages").insert({
            match_id: segment.match_id,
            sender_id: user_id,
            content: "Ruta completada — el transporte ha llegado a su destino.",
          } as never),
        ])
      }
    }

    if (newStatus === "cancelled") {
      const { data: remaining } = await service
        .from(TABLES.ROUTE_SEGMENTS)
        .select("id, status")
        .eq("match_id", segment.match_id)
        .neq("status", "cancelled")

      if (!remaining?.length) {
        await Promise.all([
          service.from(TABLES.MATCHES).update({ status: "cancelled" } as never).eq("id", segment.match_id),
          service.from(TABLES.TRAVEL_REQUESTS).update({ status: "open" } as never).eq("id", segment.travel_request_id),
          service.from("messages").insert({
            match_id: segment.match_id,
            sender_id: user_id,
            content: "Ruta cancelada — la solicitud vuelve a estar disponible para otros transportistas.",
          } as never),
        ])
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
