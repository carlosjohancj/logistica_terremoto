import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organization_id, member_email, role } = body

    if (!organization_id || !member_email) {
      return NextResponse.json({ error: "organization_id and member_email are required" }, { status: 400 })
    }

    const supabase = await getServerSupabase()
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

    // profiles has no email column (email lives on auth.users), so members
    // must be resolved through the admin API rather than a profiles query.
    const { data: usersPage, error: usersError } = await service.auth.admin.listUsers({ perPage: 1000 })
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }
    const matchedUser = usersPage.users.find((u) => u.email === member_email)

    if (!matchedUser) {
      return NextResponse.json({ error: "No user found with that email" }, { status: 404 })
    }

    const { error } = await service
      .from("organization_members")
      .insert({
        organization_id,
        member_id: matchedUser.id,
        role: role || "member",
        status: "active",
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
