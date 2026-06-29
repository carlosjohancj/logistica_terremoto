import PocketBase from "pocketbase"

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://pocketbase.asmvnzla.org"

let _pb: PocketBase | null = null

export function getPB(): PocketBase {
  if (typeof window === "undefined") {
    return new PocketBase(PB_URL)
  }
  if (!_pb) {
    _pb = new PocketBase(PB_URL)
    _pb.authStore.loadFromCookie(document.cookie)
    _pb.authStore.onChange(() => {
      document.cookie = (_pb as PocketBase).authStore.exportToCookie({ httpOnly: false })
    })
  }
  return _pb
}

export const pb = getPB()

export const COLLECTIONS = {
  USERS: "users",
  TRAVEL_REQUESTS: "travel_requests",
  TRANSPORT_OFFERS: "transport_offers",
  HOUSING_OFFERS: "housing_offers",
  DONATIONS: "donations",
  MATCHES: "matches",
  REVIEWS: "reviews",
  COMPANIES: "companies",
  JOBS: "jobs",
  SUPPLIES: "supplies",
  GRAPHICS: "graphics",
  ESTADOS: "estados",
  DONATION_SETTINGS: "donation_settings",
} as const

export type Role = "damnificado" | "transportista" | "anfitrion" | "donante" | "admin"
