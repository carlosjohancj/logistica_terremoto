import { NextResponse } from "next/server"
import { getServiceSupabase, TABLES } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role, whatsapp, age, volunteerType } = body
    // The form only collects a single WhatsApp number; reuse it as the
    // contact phone so features that read profiles.phone keep working.
    const phone = body.phone || whatsapp

    if (!email || !password || !name || !whatsapp || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, phone, whatsapp, volunteer_type: volunteerType },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: "User not created" }, { status: 500 })
    }

    const profileData: Record<string, unknown> = { id: userId, name, role: role || "damnificado", phone, whatsapp }
    if (age !== undefined) {
      profileData.age = age
    }
    if (volunteerType) {
      profileData.volunteer_type = volunteerType
    }

    const { error: profileError } = await supabase.from(TABLES.PROFILES).insert(profileData as never)

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: userId })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
