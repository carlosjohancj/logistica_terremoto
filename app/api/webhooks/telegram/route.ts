import { NextResponse } from "next/server"

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://pocketbase.asmvnzla.org"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const authResp = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: process.env.PB_ADMIN_EMAIL || "admin@asmvnzla.com",
        password: process.env.PB_ADMIN_PASSWORD || "",
      }),
    })

    if (!authResp.ok) {
      return NextResponse.json({ error: "Auth failed" }, { status: 500 })
    }

    const { token } = await authResp.json()
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }

    if (body.type === "travel_request") {
      const record = {
        origin_state: body.origin_state,
        origin_municipality: body.origin_municipality,
        origin_city: body.origin_city,
        people_to_move: body.people_to_move || 1,
        housing_destruction: body.housing_destruction || "se_puede_reparar",
        registrant_type: "damnificado",
        status: "open",
        notes: body.notes || `Creado desde Telegram. Contacto: ${body.contact || "N/A"}`,
      }
      const res = await fetch(`${PB_URL}/api/collections/travel_requests/records`, {
        method: "POST", headers, body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error(await res.text())
      return NextResponse.json({ success: true })
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
        notes: body.notes || `Creado desde Telegram. Contacto: ${body.contact || "N/A"}`,
      }
      const res = await fetch(`${PB_URL}/api/collections/transport_offers/records`, {
        method: "POST", headers, body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error(await res.text())
      return NextResponse.json({ success: true })
    }

    if (body.type === "housing_offer") {
      const record = {
        state: body.state,
        municipality: body.municipality,
        city: body.city,
        capacity: body.capacity || 1,
        max_stay_days: body.max_stay_days || 7,
        status: "open",
        notes: body.notes || `Creado desde Telegram. Contacto: ${body.contact || "N/A"}`,
      }
      const res = await fetch(`${PB_URL}/api/collections/housing_offers/records`, {
        method: "POST", headers, body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error(await res.text())
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
