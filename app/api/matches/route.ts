import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { travel_request_id, user_id } = body

    if (!travel_request_id || !user_id) {
      return NextResponse.json({ error: "Missing travel_request_id or user_id" }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { error: matchError } = await supabase.from(TABLES.MATCHES).insert({
      travel_request_id,
      user_id,
      status: "pending",
    } as never)

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from(TABLES.TRAVEL_REQUESTS)
      .update({ status: "matched" } as never)
      .eq("id", travel_request_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
