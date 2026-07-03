import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { match_id, content } = body

    if (!match_id || !content) {
      return NextResponse.json({ error: "Missing match_id or content" }, { status: 400 })
    }

    const service = getServiceSupabase()
    const { data, error } = await service
      .from("messages")
      .insert({ match_id, sender_id: user.id, content } as never)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
