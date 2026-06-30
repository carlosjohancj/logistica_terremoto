import { z } from "zod/v3"

export const transportOfferSchema = z.object({
  vehicle_type: z.enum(["moto", "carro", "camioneta", "camion"]),
  capacity: z.coerce.number().min(1),
  origin_state: z.string().min(1),
  origin_municipality: z.string().optional(),
  origin_city: z.string().optional(),
  destination_state: z.string().optional(),
  destination_municipality: z.string().optional(),
  destination_city: z.string().optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
  flexible_date: z.boolean(),
  needs_gas_donation: z.boolean(),
  gas_donation_amount: z.coerce.number().min(0).optional(),
  accepts_passengers: z.boolean(),
  accepts_cargo: z.boolean(),
  notes: z.string().optional(),
})

export type TransportOfferValues = z.infer<typeof transportOfferSchema>
