import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    if (!userId) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })

    const { id } = await params
    const service = getServiceSupabase()

    const { data: existing } = await service
      .from(TABLES.TRANSPORTISTA_TERRITORIES)
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle()

    if (!existing) return NextResponse.json({ error: "Territory not found" }, { status: 404 })

    const { error } = await service
      .from(TABLES.TRANSPORTISTA_TERRITORIES)
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
