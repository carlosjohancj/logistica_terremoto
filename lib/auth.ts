import { getPB } from "@/lib/pocketbase"
import type { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth"

export async function loginUser(values: LoginFormValues): Promise<void> {
  const pb = getPB()
  await pb.collection("users").authWithPassword(values.email, values.password)
}

export async function registerUser(values: RegisterFormValues): Promise<void> {
  const pb = getPB()
  await pb.collection("users").create({
    name: values.name,
    email: values.email,
    password: values.password,
    passwordConfirm: values.passwordConfirm,
    phone: values.phone ?? "",
    role: values.role || "damnificado",
  })
  await pb.collection("users").authWithPassword(values.email, values.password)
}
