import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { id } = await params

    const { data: existing } = await supabase
      .from("transportista_territories")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) return NextResponse.json({ error: "Territory not found" }, { status: 404 })

    const { error } = await supabase
      .from("transportista_territories")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
