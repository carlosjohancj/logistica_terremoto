import { z } from "zod/v3"

export type TravelRequestMessages = {
  errorRequired: string
  errorMinPeopleToMove: string
  errorNegativeNumber: string
}

// z.coerce.number() coerces a blank "" input to 0, which passes .min(0) --
// silently accepting "blank" as "zero". Instead these fields are registered
// with { valueAsNumber: true } (see form.tsx) so RHF hands this schema NaN
// for a blank input, matching the pattern already used for the age field in
// lib/schemas/auth.ts. superRefine on the field itself distinguishes "never
// filled in" (NaN) from "explicitly negative" and, unlike an object-level
// superRefine, still runs even when sibling fields are also invalid.
function requiredNonNegativeNumber(msgs: TravelRequestMessages) {
  return z.union([z.number(), z.nan()]).superRefine((v, ctx) => {
    if (Number.isNaN(v)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired })
      return
    }
    if (v < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorNegativeNumber })
    }
  })
}

export function createTravelRequestSchema(msgs: TravelRequestMessages) {
  return z
    .object({
      registrant_type: z.enum(["damnificado", "colaborador"], { required_error: msgs.errorRequired }),
      registrant_relation: z.string().optional(),
      origin_state: z.string().min(1, msgs.errorRequired),
      origin_municipality: z.string().min(1, msgs.errorRequired),
      origin_city: z.string().min(1, msgs.errorRequired),
      // A plain .refine() here would narrow the inferred type to `boolean`
      // (dropping `null`), which breaks the defaultValues:
      // { has_destination: null } used to keep neither Yes/No selected
      // initially. superRefine on the field itself avoids that narrowing
      // and, unlike an object-level superRefine, still runs even when
      // sibling fields (e.g. registrant_type) are also invalid.
      has_destination: z.boolean().nullable().superRefine((v, ctx) => {
        if (v === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired })
      }),
      destination_state: z.string().optional(),
      destination_municipality: z.string().optional(),
      destination_city: z.string().optional(),
      people_to_move: z.coerce.number().min(1, msgs.errorMinPeopleToMove),
      people_to_house: requiredNonNegativeNumber(msgs),
      children_count: requiredNonNegativeNumber(msgs),
      adults_count: requiredNonNegativeNumber(msgs),
      housing_destruction: z.enum(["total", "grave", "se_puede_reparar", "prestada_emergencia"], {
        required_error: msgs.errorRequired,
      }),
      needs_cargo_transport: z.boolean().optional(),
      cargo_description: z.string().optional(),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // registrant_relation and the destination_* fields are only rendered
      // (and thus only meaningfully fillable) when their gating field has a
      // particular value, so their required-ness has to be checked here
      // rather than on the field itself. Like has_destination's own check
      // above, this whole block is skipped if a sibling field already
      // failed its own validation — it still runs (and blocks submission)
      // once the rest of the form is valid.
      if (data.registrant_type === "colaborador" && !data.registrant_relation) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired, path: ["registrant_relation"] })
      }
      if (data.has_destination === true) {
        if (!data.destination_state) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired, path: ["destination_state"] })
        }
        if (!data.destination_municipality) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: msgs.errorRequired,
            path: ["destination_municipality"],
          })
        }
        if (!data.destination_city) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired, path: ["destination_city"] })
        }
      }
    })
}

export type TravelRequestValues = z.infer<ReturnType<typeof createTravelRequestSchema>>
