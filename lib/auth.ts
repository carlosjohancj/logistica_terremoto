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
  const supabase = getSupabase();
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: { data: { name: values.name, role: values.role } },
  });
  if (error) throw error;
}
