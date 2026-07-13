import { z } from "zod/v3"
import { isValidPhoneNumber } from "libphonenumber-js"

export type AuthMessages = {
  errorRequired: string
  errorEmail: string
  errorPasswordLength: string
  errorPasswordMatch: string
  errorPhone?: string
}

export function createLoginSchema(msgs: AuthMessages) {
  return z.object({
    email: z.string().min(1, msgs.errorRequired).email(msgs.errorEmail),
    password: z.string().min(1, msgs.errorRequired),
  })
}

export function createRegisterSchema(msgs: AuthMessages) {
  const errorPhone = msgs.errorPhone ?? msgs.errorEmail
  const phoneField = () =>
    z
      .string()
      .min(1, msgs.errorRequired)
      .refine((val) => isValidPhoneNumber(val), errorPhone)

  return z
    .object({
      name: z.string().min(1, msgs.errorRequired),
      email: z.string().min(1, msgs.errorRequired).email(msgs.errorEmail),
      phone: phoneField(),
      whatsapp: phoneField(),
      // react-hook-form's valueAsNumber turns an empty number input into NaN.
      // z.nan() lets that value through the base type check so the
      // superRefine below can treat it the same as "not provided" instead of
      // failing with a generic type-mismatch message.
      age: z.union([z.number(), z.nan()]).optional(),
      role: z.string().min(1, msgs.errorRequired),
      volunteerType: z.string().optional(),
      password: z.string().min(6, msgs.errorPasswordLength),
      passwordConfirm: z.string().min(6, msgs.errorPasswordLength),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: msgs.errorPasswordMatch,
      path: ["passwordConfirm"],
    })
    .superRefine((data, ctx) => {
      if (data.role !== "damnificado") return
      const age = data.age
      if (age === undefined || Number.isNaN(age)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired, path: ["age"] })
        return
      }
      if (!Number.isInteger(age) || age < 0 || age > 150) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: msgs.errorRequired, path: ["age"] })
      }
    })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>
