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
      return NextResponse.json({ error: "Only volunteers can register transportistas" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      vehicleType,
      capacity,
      originState,
      originMunicipality,
      originCity,
      destinationState,
      destinationMunicipality,
      destinationCity,
      notes,
    } = body

    if (!name || !originState || !originCity || !destinationState || !destinationCity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const password = randomBytes(8).toString("hex")
    const email = `transportista-${randomBytes(4).toString("hex")}@logistica.local`

    const service = getServiceSupabase()

    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "transportista", phone },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 500 })
    }

    const userId = authData.user.id

    const { error: profileError } = await service.from(TABLES.PROFILES).insert({
      id: userId,
      name,
      phone: phone || null,
      role: "transportista",
    } as never)

    if (profileError) {
      await service.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { error: offerError } = await service.from(TABLES.TRANSPORT_OFFERS).insert({
      user_id: userId,
      vehicle_type: vehicleType || "carro",
      capacity: capacity || 1,
      origin_state: originState,
      origin_municipality: originMunicipality || originCity,
      origin_city: originCity,
      destination_state: destinationState,
      destination_municipality: destinationMunicipality || destinationCity,
      destination_city: destinationCity,
      status: "open",
      notes: notes || null,
    } as never)

    if (offerError) {
      await service.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: offerError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
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
