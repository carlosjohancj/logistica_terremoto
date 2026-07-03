import { NextResponse } from "next/server"
import { getSupabase, getServiceSupabase, TABLES } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from(TABLES.SERVICE_PROVIDERS)
      .select("*")
      .eq("status", "active")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ providers: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from(TABLES.PROFILES)
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, website, donation_link, contact_email, contact_phone, services, logo_url } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const service = getServiceSupabase()
    const { data, error } = await service
      .from(TABLES.SERVICE_PROVIDERS)
      .insert({
        name,
        description: description || "",
        website: website || "",
        donation_link: donation_link || "",
        contact_email: contact_email || "",
        contact_phone: contact_phone || "",
        services: services || [],
        logo_url: logo_url || "",
        status: "active",
      } as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, provider: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
