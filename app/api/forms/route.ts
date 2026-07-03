import { NextResponse } from "next/server"
import { getSupabase, getServiceSupabase, TABLES } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const formType = body.formType || body.type
    const data = body.data || {}
    if (!formType) {
      return NextResponse.json({ error: "Missing formType or type" }, { status: 400 })
    }

    data.user_id = user.id

    let table: string | null = null

    if (formType === "travel_request") {
      table = TABLES.TRAVEL_REQUESTS
      data.status = data.status || "open"
    } else if (formType === "transport_offer") {
      table = TABLES.TRANSPORT_OFFERS
      data.status = data.status || "open"
    } else if (formType === "housing_offer") {
      table = TABLES.HOUSING_OFFERS
      data.status = data.status || "open"
    } else if (formType === "company") {
      table = TABLES.COMPANIES
    } else if (formType === "job") {
      table = TABLES.JOBS
      data.status = data.status || "open"
    } else if (formType === "supply") {
      table = TABLES.SUPPLIES
      data.status = data.status || "open"
    } else if (formType === "asistencia") {
      return NextResponse.json({ success: true, message: "Asistencia registrada" })
    } else {
      return NextResponse.json({ error: "Invalid formType" }, { status: 400 })
    }

    if (!table) {
      return NextResponse.json({ error: "Invalid formType" }, { status: 400 })
    }

    const service = getServiceSupabase()
    const { data: record, error } = await service.from(table).insert(data).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: (record as { id: string } | null)?.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
