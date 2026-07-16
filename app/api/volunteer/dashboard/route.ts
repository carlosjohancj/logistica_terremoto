import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase, TABLES } from "@/types/supabase"

export async function GET() {
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

    const service = getServiceSupabase()

    const [totalRes, pendingRes, verifiedRes, activeRes, transportistasRes, orgRes] = await Promise.all([
      service.from(TABLES.TRAVEL_REQUESTS)
        .select("id", { count: "exact", head: true })
        .eq("registered_by", user.id) as never as { count: number | null; error: unknown },

      service.from(TABLES.TRAVEL_REQUESTS)
        .select("id", { count: "exact", head: true })
        .eq("registered_by", user.id)
        .eq("verification_status", "unverified") as never as { count: number | null; error: unknown },

      service.from(TABLES.TRAVEL_REQUESTS)
        .select("id", { count: "exact", head: true })
        .eq("registered_by", user.id)
        .eq("verification_status", "verified") as never as { count: number | null; error: unknown },

      service.from(TABLES.TRAVEL_REQUESTS)
        .select("id", { count: "exact", head: true })
        .eq("registered_by", user.id)
        .in("status", ["open", "matched_transport", "matched_housing"]) as never as { count: number | null; error: unknown },

      service.from(TABLES.TRANSPORT_OFFERS)
        .select("id", { count: "exact", head: true }) as never as { count: number | null; error: unknown },

      service.from("organization_members")
        .select("organization_id")
        .eq("member_id", user.id)
        .eq("status", "active") as never as { data: { organization_id: string }[] | null },
    ])

    let orgInfo = null
    if (orgRes.data && orgRes.data.length > 0) {
      const orgId = orgRes.data[0].organization_id
      const { data: org } = await service
        .from("organizations")
        .select("id, name")
        .eq("id", orgId)
        .single() as never as { data: { id: string; name: string } | null }

      if (org) {
        const { count: memberCount } = await service
          .from("organization_members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("status", "active") as never as { count: number | null }

        orgInfo = { id: org.id, name: org.name, member_count: memberCount ?? 0 }
      }
    }

    return NextResponse.json({
      stats: {
        total_families: totalRes.count ?? 0,
        pending_verification: pendingRes.count ?? 0,
        verified: verifiedRes.count ?? 0,
        active_trips: activeRes.count ?? 0,
        total_transportistas: transportistasRes.count ?? 0,
      },
      organization: orgInfo,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
