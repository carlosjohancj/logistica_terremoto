import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase-server"
import { getServiceSupabase, TABLES } from "@/lib/supabase"
import { getCityCoord } from "@/lib/estados"
import { distance } from "@turf/turf"

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { travel_request_id, origin_city, origin_state, destination_city, destination_state, is_full_route, origin_lat, origin_lng, destination_lat, destination_lng } = body

    if (!travel_request_id || !origin_city || !origin_state || !destination_city || !destination_state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = getServiceSupabase()

    const originCoord = origin_lat ? { lat: origin_lat, lng: origin_lng } : await getCityCoord(origin_state, origin_city)
    const destCoord = destination_lat ? { lat: destination_lat, lng: destination_lng } : await getCityCoord(destination_state, destination_city)

    if (!originCoord || !destCoord) {
      return NextResponse.json({ error: "Could not resolve coordinates for cities" }, { status: 400 })
    }

    const from = [originCoord.lng, originCoord.lat]
    const to = [destCoord.lng, destCoord.lat]
    const distanceKm = Math.round(distance(from, to, { units: "kilometers" }) * 10) / 10

    const { data: existingSegments } = await service
      .from("route_segments")
      .select("id, \"order\"")
      .eq("travel_request_id", travel_request_id)
      .order("order", { ascending: false }) as never as { data: { id: string; order: number }[] | null }

    const nextOrder = (existingSegments?.[0]?.order ?? 0) + 1

    const { data: travelReq } = await service
      .from(TABLES.TRAVEL_REQUESTS)
      .select("destination_state, destination_city")
      .eq("id", travel_request_id)
      .single() as never as { data: { destination_state: string; destination_city: string } | null }

    const reachedFinalDest = travelReq && destination_state === travelReq.destination_state &&
      (!travelReq.destination_city || destination_city === travelReq.destination_city)

    const allCovered = is_full_route || reachedFinalDest

    let matchId: string | null = null
    if (!allCovered) {
      const { data: existingMatch } = await service
        .from(TABLES.MATCHES)
        .select("id")
        .eq("travel_request_id", travel_request_id)
        .single() as never as { data: { id: string } | null }

      if (existingMatch) {
        matchId = existingMatch.id
      }
    }

    if (!matchId) {
      const { data: newMatch } = await service
        .from(TABLES.MATCHES)
        .insert({ travel_request_id, user_id: user.id, status: allCovered ? "confirmed" : "pending" } as never)
        .select()
        .single() as never as { data: { id: string } | null }
      matchId = newMatch?.id ?? null
    }

    const { data: segment, error: segError } = await service
      .from("route_segments")
      .insert({
        match_id: matchId,
        transportista_id: user.id,
        travel_request_id,
        origin_city,
        origin_state,
        origin_lat: originCoord.lat,
        origin_lng: originCoord.lng,
        destination_city,
        destination_state,
        destination_lat: destCoord.lat,
        destination_lng: destCoord.lng,
        distance_km: distanceKm,
        order: nextOrder,
        is_full_route: !!is_full_route,
        status: allCovered ? "confirmed" : "pending",
      } as never)
      .select()
      .single()

    if (segError) {
      return NextResponse.json({ error: segError.message }, { status: 500 })
    }

    if (allCovered) {
      await service
        .from(TABLES.TRAVEL_REQUESTS)
        .update({ status: "matched" } as never)
        .eq("id", travel_request_id)
    }

    return NextResponse.json({ success: true, segment, match_id: matchId, all_covered: allCovered, distance_km: distanceKm })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
