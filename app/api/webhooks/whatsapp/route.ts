import { NextResponse } from "next/server"
import { getServiceSupabase } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabase = getServiceSupabase()

    if (body.type === "travel_request") {
      const record = {
        origin_state: body.origin_state,
        origin_municipality: body.origin_municipality,
        origin_city: body.origin_city,
        people_to_move: body.people_to_move || 1,
        housing_destruction: body.housing_destruction || "se_puede_reparar",
        registrant_type: "damnificado",
        status: "open",
        notes: body.notes || `Creado desde WhatsApp. Contacto: ${body.contact || "N/A"}`,
      }
      const { data, error } = await supabase.from("travel_requests").insert(record as never).select().single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }

    if (body.type === "transport_offer") {
      const record = {
        vehicle_type: body.vehicle_type || "carro",
        capacity: body.capacity || 1,
        origin_state: body.origin_state,
        origin_municipality: body.origin_municipality,
        origin_city: body.origin_city,
        destination_state: body.destination_state,
        destination_municipality: body.destination_municipality,
        destination_city: body.destination_city,
        status: "open",
        notes: body.notes || `Creado desde WhatsApp. Contacto: ${body.contact || "N/A"}`,
      }
      const { data, error } = await supabase.from("transport_offers").insert(record as never).select().single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }

    if (body.type === "housing_offer") {
      const record = {
        state: body.state,
        municipality: body.municipality,
        city: body.city,
        capacity: body.capacity || 1,
        max_stay_days: body.max_stay_days || 7,
        status: "open",
        notes: body.notes || `Creado desde WhatsApp. Contacto: ${body.contact || "N/A"}`,
      }
      const { data, error } = await supabase.from("housing_offers").insert(record as never).select().single()
      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
