import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role, phone } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, phone },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: "User not created" }, { status: 500 })
    }

    const { error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .insert({ id: userId, name, role: role || "damnificado", phone })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: userId })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
