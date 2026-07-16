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
      return NextResponse.json({ error: "Only volunteers can verify families" }, { status: 403 })
    }

    const body = await request.json()
    const {
      travel_request_id,
      building_destroyed,
      total_loss,
      no_destination,
      building_address,
      testimonial,
      verification_notes,
      reference_contact,
    } = body

    if (!travel_request_id) {
      return NextResponse.json({ error: "travel_request_id is required" }, { status: 400 })
    }

    const service = getServiceSupabase()

    const { data: travelReq } = await service
      .from(TABLES.TRAVEL_REQUESTS)
      .select("id, verification_status")
      .eq("id", travel_request_id)
      .single() as never as { data: { id: string; verification_status: string } | null }

    if (!travelReq) {
      return NextResponse.json({ error: "Travel request not found" }, { status: 404 })
    }

    const buildingInfo = {
      destroyed: !!building_destroyed,
      total_loss: !!total_loss,
      no_destination: !!no_destination,
      address: building_address || null,
      testimonial: testimonial || null,
    }

    const { error: updateError } = await service
      .from(TABLES.TRAVEL_REQUESTS)
      .update({
        verification_status: "verified",
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        building_info: buildingInfo,
        verification_notes: verification_notes || null,
        reference_contact: reference_contact || null,
      } as never)
      .eq("id", travel_request_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await service.from("verification_log").insert({
      travel_request_id,
      volunteer_id: user.id,
      action: "verify",
      previous_status: travelReq.verification_status,
      new_status: "verified",
      notes: verification_notes || null,
      metadata: buildingInfo,
    } as never)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
