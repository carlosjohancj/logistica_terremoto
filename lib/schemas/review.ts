import { z } from "zod/v3"

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  category: z.enum(["transporte", "hospedaje", "colaboracion"]),
  comment: z.string().optional(),
})

export type ReviewValues = z.infer<typeof reviewSchema>
