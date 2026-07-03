import { NextResponse } from "next/server"
import { getServerSupabase, getServiceSupabase, TABLES } from "@/lib/supabase"

async function checkAdmin() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from(TABLES.PROFILES).select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return null
  return user
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const service = getServiceSupabase()
    const { data, error } = await service
      .from(TABLES.SERVICE_PROVIDERS)
      .update(body as never)
      .eq("id", id)
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const service = getServiceSupabase()
    const { error } = await service
      .from(TABLES.SERVICE_PROVIDERS)
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
