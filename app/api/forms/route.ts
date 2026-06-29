import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formType, data } = body
    if (!formType || !data) {
      return NextResponse.json({ error: "Missing formType or data" }, { status: 400 })
    }

    let table: string

    if (formType === "travel_request") {
      table = TABLES.TRAVEL_REQUESTS
      data.status = data.status || "open"
      data.registrant_type = data.registrant_type || "damnificado"
      data.housing_destruction = data.housing_destruction || "se_puede_reparar"
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
    } else {
      return NextResponse.json({ error: "Invalid formType" }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data: record, error } = await supabase.from(table).insert(data).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: (record as { id: string } | null)?.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
