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
import { registerUser } from "@/lib/auth"
import { getSupabase } from "@/lib/supabase"
import { createRegisterSchema, type RegisterFormValues } from "@/lib/schemas/auth"
import { FIELD_CLASS, PASSWORD_FIELD_CLASS, SELECT_TRIGGER_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const [loading, setLoading] = useState(false)

  const roleLabels: Record<string, string> = {
    damnificado: t("roleDamnificado"),
    transportista: t("roleTransportista"),
    anfitrion: t("roleAnfitrion"),
    donante: t("roleDonante"),
    voluntario: t("roleVoluntario"),
  }

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
      await registerUser(values)
      const supabase = getSupabase()
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
              <Input id="name" className={FIELD_CLASS} {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" className={FIELD_CLASS} {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" type="tel" className={FIELD_CLASS} {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>{t("role")}</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? "damnificado"} onValueChange={field.onChange}>
                    <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                      <SelectValue placeholder={t("role")}>
                        {(value: string | null) => (value ? roleLabels[value] : null)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damnificado">{t("roleDamnificado")}</SelectItem>
                      <SelectItem value="transportista">{t("roleTransportista")}</SelectItem>
                      <SelectItem value="anfitrion">{t("roleAnfitrion")}</SelectItem>
                      <SelectItem value="donante">{t("roleDonante")}</SelectItem>
                      <SelectItem value="voluntario">{t("roleVoluntario")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <PasswordInput id="password" className={PASSWORD_FIELD_CLASS} {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t("passwordConfirm")}</Label>
              <PasswordInput id="passwordConfirm" className={PASSWORD_FIELD_CLASS} {...register("passwordConfirm")} />
              {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>}
            </div>
            <Button type="submit" className={cn("w-full", BUTTON_HEIGHT_CLASS)} disabled={loading}>
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
