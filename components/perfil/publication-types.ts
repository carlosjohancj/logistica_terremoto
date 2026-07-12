export type PublicationKind = "travel_request" | "transport_offer" | "housing_offer" | "supply"

export type PublicationRecord = Record<string, unknown> & { id: string; status?: string }

export type Publication = { kind: PublicationKind; data: PublicationRecord }
