import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase, TABLES } from "@/types/supabase"

export async function GET(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const volunteerRole = (user.user_metadata as Record<string, unknown>)?.role as string
    if (volunteerRole !== "voluntario" && volunteerRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const orgFilter = searchParams.get("org") === "true"

    const service = getServiceSupabase()

    let memberIds: string[] = [user.id]

    if (orgFilter) {
      const { data: memberships } = await service
        .from("organization_members")
        .select("organization_id")
        .eq("member_id", user.id)
        .eq("status", "active") as never as { data: { organization_id: string }[] | null }

      if (memberships && memberships.length > 0) {
        const orgIds = memberships.map((m) => m.organization_id)
        const { data: orgMembers } = await service
          .from("organization_members")
          .select("member_id")
          .in("organization_id", orgIds)
          .eq("status", "active") as never as { data: { member_id: string }[] | null }

        if (orgMembers) {
          memberIds = [...new Set([...memberIds, ...orgMembers.map((m) => m.member_id)])]
        }
      }
    }

    let query = service
      .from(TABLES.TRAVEL_REQUESTS)
      .select("*, profiles:user_id(name, phone)")
      .in("registered_by", memberIds)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("verification_status", status) as never
    }

    const { data: families, error } = await query as never as {
      data: Record<string, unknown>[] | null
      error: unknown
    }

    if (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    return NextResponse.json({ families: families ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
