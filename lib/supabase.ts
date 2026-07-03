import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

let _browserClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (typeof window === "undefined") {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    })
  }
  if (!_browserClient) {
    _browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _browserClient
}

let _serviceClient: ReturnType<typeof createClient> | null = null

export function getServiceSupabase() {
  if (!_serviceClient) {
    _serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  }
  return _serviceClient
}

export const TABLES = {
  PROFILES: "profiles",
  TRAVEL_REQUESTS: "travel_requests",
  TRANSPORT_OFFERS: "transport_offers",
  HOUSING_OFFERS: "housing_offers",
  DONATIONS: "donations",
  MATCHES: "matches",
  COMPANIES: "companies",
  JOBS: "jobs",
  SUPPLIES: "supplies",
  GRAPHICS: "graphics",
  ESTADOS: "estados",
  DONATION_SETTINGS: "donation_settings",
  ROUTE_SEGMENTS: "route_segments",
  SERVICE_PROVIDERS: "service_providers",
  FAMILY_AID_REQUESTS: "family_aid_requests",
} as const

export type Role = "damnificado" | "transportista" | "anfitrion" | "donante" | "voluntario" | "organizacion" | "admin"
