import { NextResponse } from "next/server"
import { getServiceSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { match_id, sender_id, content } = body

    if (!match_id || !sender_id || !content) {
      return NextResponse.json({ error: "Missing match_id, sender_id, or content" }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from("messages")
      .insert({ match_id, sender_id, content } as never)
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
