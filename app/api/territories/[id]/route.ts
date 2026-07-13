import { getServiceSupabase, TABLES } from "@/types/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    if (!userId)
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    const { id } = await params;
    const service = getServiceSupabase();

    const { data: existing } = (await service
      .from(TABLES.TRANSPORTISTA_TERRITORIES)
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle()) as never as { data: { id: string } | null; error: any };

    if (!existing)
      return NextResponse.json(
        { error: "Territory not found" },
        { status: 404 }
      );

    const { error } = (await service
      .from(TABLES.TRANSPORTISTA_TERRITORIES)
      .delete()
      .eq("id", id)) as never as { error: any };

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
