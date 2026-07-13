import { NextResponse } from "next/server";
import { getServiceSupabase, TABLES } from "@/types/supabase";
import { getCityCoord } from "@/lib/estados";
import { distance } from "@turf/turf";

const MAX_ACTIVE_ROUTES = 3;

function sortSegments(data: any[], column: string, dir: "asc" | "desc") {
  const sorted = [...data].sort((a, b) => {
    const va = a[column] ?? 0;
    const vb = b[column] ?? 0;
    if (typeof va === "string" && typeof vb === "string") {
      return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return dir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
  });
  return sorted;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const travelRequestId = searchParams.get("travel_request_id");
    const transportistaId = searchParams.get("transportista_id");
    const travelRequestIds = searchParams.get("travel_request_ids");
    const limitParam = searchParams.get("limit");
    const includeProfile = searchParams.get("include_profile") === "true";

    const service = getServiceSupabase();

    const selectCols = includeProfile
      ? "*, profiles:transportista_id(name, phone)"
      : "*";

    let query = service.from("route_segments").select(selectCols);

    if (travelRequestId) {
      query = query.eq("travel_request_id", travelRequestId);
    }
    if (transportistaId) {
      query = query.eq("transportista_id", transportistaId);
    }
    if (travelRequestIds) {
      const ids = travelRequestIds.split(",").map((s) => s.trim());
      query = query.in("travel_request_id", ids);
    }

    const { data, error } = (await query) as never as {
      data: any[] | null;
      error: any;
    };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let segments = data ?? [];

    segments = sortSegments(segments, "order", "asc");

    const limit = limitParam ? parseInt(limitParam, 10) : 0;
    if (limit > 0) {
      segments = segments.slice(0, limit);
    }

    return NextResponse.json({ segments });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      travel_request_id,
      origin_city,
      origin_state,
      destination_city,
      destination_state,
      is_full_route,
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      route_geometry,
      scheduled_date,
      estimated_hours,
    } = body;

    if (!user_id)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (
      !travel_request_id ||
      !origin_city ||
      !origin_state ||
      !destination_city ||
      !destination_state
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = getServiceSupabase();

    if (scheduled_date) {
      const { count } = await service
        .from(TABLES.ROUTE_SEGMENTS)
        .select("id", { count: "exact", head: true })
        .eq("transportista_id", user_id)
        .eq("scheduled_date", scheduled_date)
        .in("status", ["pending", "in_progress"]);

      if (count && count > 0) {
        return NextResponse.json(
          {
            error: `Ya tienes una ruta programada para el ${scheduled_date}. Elige otra fecha.`,
          },
          { status: 409 }
        );
      }
    }

    const { data: travelReq } = (await service
      .from(TABLES.TRAVEL_REQUESTS)
      .select("people_to_move, destination_state, destination_city")
      .eq("id", travel_request_id)
      .single()) as never as {
      data: {
        people_to_move: number;
        destination_state: string;
        destination_city: string;
      } | null;
    };

    if (!travelReq) {
      return NextResponse.json(
        { error: "Travel request not found" },
        { status: 404 }
      );
    }

    const { data: offer } = (await service
      .from("transport_offers")
      .select("capacity, vehicle_type")
      .eq("user_id", user_id)
      .eq("status", "open")
      .eq("origin_state", origin_state)
      .maybeSingle()) as never as {
      data: { capacity: number; vehicle_type: string } | null;
    };

    const capacityExceeded = offer && travelReq.people_to_move > offer.capacity;

    const originCoord = origin_lat
      ? { lat: origin_lat, lng: origin_lng }
      : await getCityCoord(origin_state, origin_city);
    const destCoord = destination_lat
      ? { lat: destination_lat, lng: destination_lng }
      : await getCityCoord(destination_state, destination_city);

    if (!originCoord || !destCoord) {
      return NextResponse.json(
        { error: "Could not resolve coordinates for cities" },
        { status: 400 }
      );
    }

    const from = [originCoord.lng, originCoord.lat];
    const to = [destCoord.lng, destCoord.lat];
    const distanceKm =
      Math.round(distance(from, to, { units: "kilometers" }) * 10) / 10;

    const { data: existingSegments } = (await service
      .from(TABLES.ROUTE_SEGMENTS)
      .select('id, "order", transportista_id, origin_city, destination_city')
      .eq("travel_request_id", travel_request_id)) as never as {
      data:
        | {
            id: string;
            order: number;
            transportista_id: string;
            origin_city: string;
            destination_city: string;
          }[]
        | null;
    };

    const sorted = sortSegments(existingSegments ?? [], "order", "desc");
    const nextOrder = (sorted[0]?.order ?? 0) + 1;

    const overlap = (existingSegments ?? []).find(
      (s) =>
        s.origin_city === origin_city && s.destination_city === destination_city
    );
    if (overlap) {
      return NextResponse.json(
        {
          error: `El tramo ${origin_city} → ${destination_city} ya está cubierto por otro transportista.`,
        },
        { status: 409 }
      );
    }

    const reachedFinalDest =
      travelReq &&
      destination_state === travelReq.destination_state &&
      (!travelReq.destination_city ||
        destination_city === travelReq.destination_city);

    const allCovered = is_full_route || reachedFinalDest;

    let matchId: string | null = null;
    if (!allCovered) {
      const { data: existingMatch } = (await service
        .from(TABLES.MATCHES)
        .select("id")
        .eq("travel_request_id", travel_request_id)
        .single()) as never as { data: { id: string } | null };

      if (existingMatch) {
        matchId = existingMatch.id;
      }
    }

    if (!matchId) {
      const { data: newMatch } = (await service
        .from(TABLES.MATCHES)
        .insert({
          travel_request_id,
          user_id,
          status: allCovered ? "confirmed" : "pending",
        } as never)
        .select()
        .single()) as never as { data: { id: string } | null };
      matchId = newMatch?.id ?? null;
    }

    const segmentData: Record<string, unknown> = {
      match_id: matchId,
      transportista_id: user_id,
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
      route_geometry: route_geometry || null,
    };

    if (scheduled_date) segmentData.scheduled_date = scheduled_date;
    if (estimated_hours) segmentData.estimated_hours = estimated_hours;

    const { data: segment, error: segError } = await service
      .from(TABLES.ROUTE_SEGMENTS)
      .insert(segmentData as never)
      .select()
      .single();

    if (segError) {
      return NextResponse.json({ error: segError.message }, { status: 500 });
    }

    if (allCovered) {
      await service
        .from(TABLES.TRAVEL_REQUESTS)
        .update({ status: "matched" } as never)
        .eq("id", travel_request_id);
    }

    return NextResponse.json({
      success: true,
      segment,
      match_id: matchId,
      all_covered: allCovered,
      distance_km: distanceKm,
      capacityExceeded: !!capacityExceeded,
      vehicleCapacity: offer?.capacity,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
