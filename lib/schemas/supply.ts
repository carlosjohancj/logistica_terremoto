import { z } from "zod/v3"

export const supplySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  quantity: z.coerce.number().min(0).optional(),
  condition: z.string().optional(),
  state: z.string().min(1),
  municipality: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  contact_name: z.string().min(1),
  contact_phone: z.string().optional(),
  needs_transport: z.boolean(),
})

export type SupplyValues = z.infer<typeof supplySchema>
