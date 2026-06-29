import { NextResponse } from "next/server"

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://pocketbase.asmvnzla.org"

async function getAdminHeaders() {
  const resp = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: process.env.PB_ADMIN_EMAIL || "admin@asmvnzla.com",
      password: process.env.PB_ADMIN_PASSWORD || "",
    }),
  })
  if (!resp.ok) throw new Error("PB admin auth failed")
  const { token } = await resp.json()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as const
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formType, data } = body
    if (!formType || !data) {
      return NextResponse.json({ error: "Missing formType or data" }, { status: 400 })
    }

    const headers = await getAdminHeaders()
    let collection: string

    if (formType === "travel_request") {
      collection = "travel_requests"
      data.status = data.status || "open"
      data.registrant_type = data.registrant_type || "damnificado"
      data.housing_destruction = data.housing_destruction || "se_puede_reparar"
    } else if (formType === "transport_offer") {
      collection = "transport_offers"
      data.status = data.status || "open"
    } else if (formType === "housing_offer") {
      collection = "housing_offers"
      data.status = data.status || "open"
    } else if (formType === "company") {
      collection = "companies"
    } else if (formType === "job") {
      collection = "jobs"
      data.status = data.status || "open"
    } else {
      return NextResponse.json({ error: "Invalid formType" }, { status: 400 })
    }

    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: errText }, { status: res.status })
    }

    const record = await res.json()
    return NextResponse.json({ success: true, id: record.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
