export type TransportRequest = Record<string, any>

export type TransportistaOffer = {
  capacity: number
  origin_state: string
  accepts_passengers: boolean
  accepts_cargo: boolean
}

export type CargoType = "cargo" | "passengers"

export type CapacityInfo = {
  capacity: number
  exceeded: boolean
}

export function getCapacityInfo(
  request: TransportRequest,
  offers?: TransportistaOffer[]
): CapacityInfo | null {
  if (!offers?.length) return null
  const match = offers.find((offer) => offer.origin_state === request.origin_state)
  if (!match) return null
  return {
    capacity: match.capacity,
    exceeded: request.people_to_move > match.capacity,
  }
}

export function getCargoTypes(request: TransportRequest): CargoType[] {
  const types: CargoType[] = []
  if (request.needs_cargo_transport) types.push("cargo")
  if (request.needs_passenger_transport !== false) types.push("passengers")
  return types
}
