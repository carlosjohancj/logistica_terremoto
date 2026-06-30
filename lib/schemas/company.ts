import { z } from "zod/v3"

export const companySchema = z.object({
  name: z.string().min(1),
  rif: z.string().optional(),
  sector: z.string().min(1),
  state: z.string().optional(),
  municipality: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  contact_name: z.string().min(1),
  contact_phone: z.string().optional(),
  contact_email: z.string().email(),
  website: z.string().url().optional().or(z.literal("")),
})

export type CompanyValues = z.infer<typeof companySchema>
