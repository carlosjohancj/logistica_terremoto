import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase, TABLES } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const volunteerRole = (user.user_metadata as Record<string, unknown>)?.role as string
    if (volunteerRole !== "voluntario" && volunteerRole !== "admin") {
      return NextResponse.json({ error: "Only volunteers can assign transport" }, { status: 403 })
    }

    const body = await request.json()
    const {
      travel_request_id,
      transportista_id,
      origin_city,
      origin_state,
      destination_city,
      destination_state,
      scheduled_date,
    } = body

    if (!travel_request_id || !transportista_id || !origin_city || !origin_state || !destination_city || !destination_state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = getServiceSupabase()

    const { data: travelReq } = await service
      .from(TABLES.TRAVEL_REQUESTS)
      .select("id, destination_state, destination_city, verification_status")
      .eq("id", travel_request_id)
      .single() as never as { data: { id: string; destination_state: string; destination_city: string; verification_status: string } | null }

    if (!travelReq) {
      return NextResponse.json({ error: "Travel request not found" }, { status: 404 })
    }

    if (travelReq.verification_status !== "verified") {
      return NextResponse.json({ error: "Family must be verified before assigning transport" }, { status: 400 })
    }

    const isFullRoute =
      destination_state === travelReq.destination_state &&
      (!travelReq.destination_city || destination_city === travelReq.destination_city)

    const { data: match } = await service
      .from(TABLES.MATCHES)
      .insert({
        travel_request_id,
        user_id: transportista_id,
        status: isFullRoute ? "confirmed" : "pending",
      } as never)
      .select()
      .single() as never as { data: { id: string } | null }

    if (!match) {
      return NextResponse.json({ error: "Failed to create match" }, { status: 500 })
    }

    const segmentData: Record<string, unknown> = {
      match_id: match.id,
      transportista_id,
      travel_request_id,
      origin_city,
      origin_state,
      destination_city,
      destination_state,
      order: 1,
      is_full_route: isFullRoute,
      status: isFullRoute ? "confirmed" : "pending",
    }

    if (scheduled_date) segmentData.scheduled_date = scheduled_date

    const { data: segment, error: segError } = await service
      .from(TABLES.ROUTE_SEGMENTS)
      .insert(segmentData as never)
      .select()
      .single()

    if (segError) {
      return NextResponse.json({ error: segError.message }, { status: 500 })
    }

    if (isFullRoute) {
      await service
        .from(TABLES.TRAVEL_REQUESTS)
        .update({ status: "matched_transport" } as never)
        .eq("id", travel_request_id)
    }

    await service.from("verification_log").insert({
      travel_request_id,
      volunteer_id: user.id,
      action: "assign_transport",
      previous_status: travelReq.verification_status,
      new_status: "verified",
      notes: `Transportista ${transportista_id} asignado para ruta ${origin_city} → ${destination_city}`,
      metadata: {
        transportista_id,
        origin_city,
        destination_city,
        is_full_route: isFullRoute,
      },
    } as never)

    return NextResponse.json({
      success: true,
      match_id: match.id,
      segment_id: (segment as Record<string, unknown>).id,
      is_full_route: isFullRoute,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
