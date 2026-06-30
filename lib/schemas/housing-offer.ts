import { z } from "zod/v3"

export const housingOfferSchema = z.object({
  state: z.string().min(1),
  municipality: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  capacity: z.coerce.number().min(1),
  max_stay_days: z.coerce.number().min(1),
  accepts_children: z.boolean(),
  accepts_adults: z.boolean(),
  accepts_families: z.boolean(),
  has_furniture: z.boolean(),
  has_kitchen: z.boolean(),
  has_bathroom: z.boolean(),
  notes: z.string().optional(),
})

export type HousingOfferValues = z.infer<typeof housingOfferSchema>

export type BooleanToggleField = keyof Pick<
  HousingOfferValues,
  | "accepts_children"
  | "accepts_adults"
  | "accepts_families"
  | "has_furniture"
  | "has_kitchen"
  | "has_bathroom"
>
