import { NextResponse } from "next/server"
import { getSupabase, getServiceSupabase, TABLES } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organization_id, member_email, role } = body

    if (!organization_id || !member_email) {
      return NextResponse.json({ error: "organization_id and member_email are required" }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const service = getServiceSupabase()

    const { data: org } = await service
      .from("organizations")
      .select("admin_id")
      .eq("id", organization_id)
      .single() as never as { data: { admin_id: string } | null }

    if (!org || org.admin_id !== user.id) {
      return NextResponse.json({ error: "Only the organization admin can add members" }, { status: 403 })
    }

    const { data: memberProfile } = await service
      .from(TABLES.PROFILES)
      .select("id")
      .eq("email", member_email)
      .single() as never as { data: { id: string } | null }

    if (!memberProfile) {
      return NextResponse.json({ error: "No user found with that email" }, { status: 404 })
    }

    const { error } = await service
      .from("organization_members")
      .insert({
        organization_id,
        member_id: memberProfile.id,
        role: role || "member",
        status: "active",
      } as never)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
