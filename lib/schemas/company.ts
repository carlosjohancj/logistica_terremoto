import { z } from "zod/v3"

export const companySchema = z.object({
  name: z.string().min(1),
  rif: z.string().optional(),
  sector: z.string().min(1),
  state: z.string().min(1),
  municipality: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional(),
  contact_name: z.string().min(1),
  contact_phone: z.string().min(1),
  contact_email: z.string().email(),
  website: z.string().url().optional().or(z.literal("")),
})

export type CompanyValues = z.infer<typeof companySchema>
