import { z } from "zod/v3"

export const familyAidSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  story: z.string().optional(),
  amount: z.string().optional(),
  help_type: z.string().min(1),
  state: z.string().optional(),
  city: z.string().optional(),
})

export type FamilyAidValues = z.infer<typeof familyAidSchema>
