import { NextResponse } from "next/server"
import { getServerSupabase, getServiceSupabase, TABLES } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, contact_email, contact_phone } = body

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const service = getServiceSupabase()

    const { data: org, error } = await service
      .from("organizations")
      .insert({
        name,
        description: description || "",
        contact_email: contact_email || "",
        contact_phone: contact_phone || "",
        admin_id: user.id,
      } as never)
      .select()
      .single() as never as { data: { id: string } | null; error: unknown }

    if (error || !org) {
      return NextResponse.json({ error: error ? String(error) : "Failed to create org" }, { status: 500 })
    }

    await service
      .from("organization_members")
      .insert({
        organization_id: org.id,
        member_id: user.id,
        role: "admin",
        status: "active",
      } as never)

    return NextResponse.json({ success: true, organization: org })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const service = getServiceSupabase()

    const [orgResult, memberResult] = await Promise.all([
      service.from("organizations")
        .select("*")
        .eq("admin_id", user.id)
        .single() as never as { data: Record<string, unknown> | null; error: unknown },
      service.from("organization_members")
        .select("*, profiles:member_id(name, email, phone)")
        .eq("member_id", user.id) as never as { data: Record<string, unknown>[] | null; error: unknown },
    ])

    let org = orgResult.data
    let members: Record<string, unknown>[] = []

    if (org) {
      const { data: orgMembers } = await service
        .from("organization_members")
        .select("*, profiles:member_id(id, name, email, phone)")
        .eq("organization_id", (org as Record<string, string>).id) as never as { data: Record<string, unknown>[] | null }
      members = orgMembers ?? []
    } else if (memberResult.data && memberResult.data.length > 0) {
      org = memberResult.data[0]
    }

    return NextResponse.json({ organization: org, members })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
