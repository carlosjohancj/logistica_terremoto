import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase, TABLES } from "@/types/supabase"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const volunteerRole = (user.user_metadata as Record<string, unknown>)?.role as string
    if (volunteerRole !== "voluntario" && volunteerRole !== "admin") {
      return NextResponse.json({ error: "Only volunteers can register families" }, { status: 403 })
    }

    const body = await request.json()
    const {
      familyName,
      members,
      childrenCount,
      adultsCount,
      originState,
      originMunicipality,
      originCity,
      destinationState,
      destinationMunicipality,
      destinationCity,
      hasDestination,
      housingDestruction,
      buildingInfo,
      referenceContact,
      notes,
    } = body

    if (!familyName || !originState || !originCity) {
      return NextResponse.json({ error: "Missing required fields: familyName, originState, originCity" }, { status: 400 })
    }

    const password = randomBytes(8).toString("hex")
    const email = `familia-${randomBytes(4).toString("hex")}@logistica.local`

    const service = getServiceSupabase()

    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: familyName, role: "damnificado" },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 500 })
    }

    const userId = authData.user.id

    const { error: profileError } = await service.from(TABLES.PROFILES).insert({
      id: userId,
      name: familyName,
      role: "damnificado",
    } as never)

    if (profileError) {
      await service.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { data: travelReq, error: travelError } = await service
      .from(TABLES.TRAVEL_REQUESTS)
      .insert({
        user_id: userId,
        registered_by: user.id,
        verification_status: "unverified",
        origin_state: originState,
        origin_municipality: originMunicipality || originCity,
        origin_city: originCity,
        destination_state: destinationState || null,
        destination_municipality: destinationMunicipality || null,
        destination_city: destinationCity || null,
        has_destination: !!hasDestination,
        people_to_move: (childrenCount || 0) + (adultsCount || 1),
        people_to_house: (childrenCount || 0) + (adultsCount || 1),
        children_count: childrenCount || 0,
        adults_count: adultsCount || 1,
        housing_destruction: housingDestruction || "se_puede_reparar",
        members: members || [],
        registrant_type: "damnificado",
        status: "open",
        building_info: buildingInfo || {},
        reference_contact: referenceContact || null,
        notes: notes || null,
      } as never)
      .select()
      .single()

    if (travelError) {
      await service.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: travelError.message }, { status: 500 })
    }

    await service.from("verification_log").insert({
      travel_request_id: travelReq.id,
      volunteer_id: user.id,
      action: "register",
      previous_status: null,
      new_status: "unverified",
      notes: `Familia registrada por voluntario: ${familyName}`,
      metadata: { origin: `${originCity}, ${originState}` },
    } as never)

    return NextResponse.json({
      success: true,
      travel_request_id: travelReq.id,
      credentials: {
        email,
        password,
        url: `${request.headers.get("origin") || ""}/auth/login`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
