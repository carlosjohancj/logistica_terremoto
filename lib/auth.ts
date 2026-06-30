import type { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth";
import { getSupabase } from "./supabase";

export async function loginUser(values: LoginFormValues): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });
  if (error) throw error;
}

export async function registerUser(values: RegisterFormValues): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Registration failed")
}
