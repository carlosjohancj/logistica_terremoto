"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { getSupabase } from "@/lib/supabase"
import { createRegisterSchema, type RegisterFormValues } from "@/lib/schemas/auth"

export default function RegisterPage() {
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(
      createRegisterSchema({
        errorRequired: t("errorRequired"),
        errorEmail: t("errorEmail"),
        errorPasswordLength: t("errorPasswordLength"),
        errorPasswordMatch: t("errorPasswordMatch"),
      })
    ),
    defaultValues: { role: "damnificado" },
  })

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name, role: values.role, phone: values.phone } },
      })
      // Ignore email confirmation errors — user is created, sign in directly
      if (signUpError && !signUpError.message.includes("confirmation email")) {
        throw signUpError
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (signInError) throw signInError
      toast.success(tc("success"))
      router.push(`/${locale}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("register")}</CardTitle>
          <CardDescription>{t("registerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>{t("role")}</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? "damnificado"} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damnificado">{t("roleDamnificado")}</SelectItem>
                      <SelectItem value="transportista">{t("roleTransportista")}</SelectItem>
                      <SelectItem value="anfitrion">{t("roleAnfitrion")}</SelectItem>
                      <SelectItem value="donante">{t("roleDonante")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <PasswordInput id="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t("passwordConfirm")}</Label>
              <PasswordInput id="passwordConfirm" {...register("passwordConfirm")} />
              {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tc("loading") : t("submit")}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t("hasAccount")}{" "}
            <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
              {t("loginHere")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
