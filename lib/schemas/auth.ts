import { z } from "zod/v3"

export type AuthMessages = {
  errorRequired: string
  errorEmail: string
  errorPasswordLength: string
  errorPasswordMatch: string
}

export function createLoginSchema(msgs: AuthMessages) {
  return z.object({
    email: z.string().min(1, msgs.errorRequired).email(msgs.errorEmail),
    password: z.string().min(1, msgs.errorRequired),
  })
}

export function createRegisterSchema(msgs: AuthMessages) {
  return z
    .object({
      name: z.string().min(1, msgs.errorRequired),
      email: z.string().min(1, msgs.errorRequired).email(msgs.errorEmail),
      phone: z.string().optional(),
      age: z.coerce.number().int().min(0).max(150).optional(),
      role: z.string().optional(),
      volunteerType: z.string().optional(),
      password: z.string().min(6, msgs.errorPasswordLength),
      passwordConfirm: z.string().min(6, msgs.errorPasswordLength),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: msgs.errorPasswordMatch,
      path: ["passwordConfirm"],
    })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>
