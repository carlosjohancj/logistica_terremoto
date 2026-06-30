import { z } from "zod/v3"

export const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  requirements: z.string().optional(),
  location_state: z.string().min(1),
  location_city: z.string().optional(),
  modality: z.enum(["presencial", "remoto", "hibrido"]),
  salary_range: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
})

export type JobValues = z.infer<typeof jobSchema>
