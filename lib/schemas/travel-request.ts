import { z } from "zod/v3"

export const travelRequestSchema = z.object({
  registrant_type: z.enum(["damnificado", "colaborador"]),
  registrant_relation: z.string().optional(),
  origin_state: z.string().min(1),
  origin_municipality: z.string().optional(),
  origin_city: z.string().optional(),
  has_destination: z.boolean().nullable(),
  destination_state: z.string().optional(),
  destination_municipality: z.string().optional(),
  destination_city: z.string().optional(),
  people_to_move: z.coerce.number().min(1),
  people_to_house: z.coerce.number().min(0).optional(),
  children_count: z.coerce.number().min(0).optional(),
  adults_count: z.coerce.number().min(0).optional(),
  housing_destruction: z.enum(["total", "grave", "se_puede_reparar", "prestada_emergencia"]),
  needs_cargo_transport: z.boolean().optional(),
  cargo_description: z.string().optional(),
  notes: z.string().optional(),
})

export type TravelRequestValues = z.infer<typeof travelRequestSchema>
