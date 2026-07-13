"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { registerUser } from "@/lib/auth"
import { createRegisterSchema, type RegisterFormValues } from "@/lib/schemas/auth"
import { FIELD_CLASS, PASSWORD_FIELD_CLASS, SELECT_TRIGGER_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"
import { FormField } from "@/components/shared/form-field"
import { PhoneInput } from "@/components/shared/phone-input"

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
    organizacion: t("roleOrganizacion"),
  }

  const volunteerTypeLabels: Record<string, string> = {
    hospedaje: t("voluntarioHospedaje"),
    gestion: t("voluntarioGestion"),
    ambos: t("voluntarioAmbos"),
  }

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(
      createRegisterSchema({
        errorRequired: t("errorRequired"),
        errorEmail: t("errorEmail"),
        errorPasswordLength: t("errorPasswordLength"),
        errorPasswordMatch: t("errorPasswordMatch"),
        errorPhone: t("errorPhone"),
      })
    ),
    defaultValues: { role: "damnificado", whatsapp: "" },
  })

  const selectedRole = watch("role")

  // The volunteerType field unmounts when the role changes away from
  // "voluntario", but react-hook-form doesn't clear an unmounted Controller's
  // value on its own — reset it so a stale selection can't leak into the
  // submitted payload for a different role.
  useEffect(() => {
    if (selectedRole !== "voluntario") {
      setValue("volunteerType", undefined)
    }
  }, [selectedRole, setValue])

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true)
    try {
      await registerUser(values)
      toast.success(tc("success"))
      router.push(`/${locale}/auth/login`)
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label={t("name")} required error={errors.name?.message}>
              {(field) => (
                <Input {...field} autoComplete="name" className={FIELD_CLASS} {...register("name")} />
              )}
            </FormField>
            <FormField label={t("email")} required error={errors.email?.message}>
              {(field) => (
                <Input {...field} type="email" autoComplete="email" className={FIELD_CLASS} {...register("email")} />
              )}
            </FormField>
            <FormField label={t("whatsapp")} required error={errors.whatsapp?.message}>
              {(field) => (
                <Controller
                  name="whatsapp"
                  control={control}
                  render={({ field: rhf }) => (
                    <PhoneInput
                      id={field.id}
                      value={rhf.value ?? ""}
                      onChange={rhf.onChange}
                      onBlur={rhf.onBlur}
                      aria-invalid={field["aria-invalid"]}
                      aria-describedby={field["aria-describedby"]}
                      aria-required={field["aria-required"]}
                    />
                  )}
                />
              )}
            </FormField>
            <FormField label={t("role")} required error={errors.role?.message}>
              {(field) => (
                <Controller
                  name="role"
                  control={control}
                  render={({ field: rhf }) => (
                    <Select value={rhf.value ?? "damnificado"} onValueChange={rhf.onChange}>
                      <SelectTrigger id={field.id} className={SELECT_TRIGGER_CLASS}>
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
                        <SelectItem value="organizacion">{t("roleOrganizacion")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>
            {selectedRole === "damnificado" && (
              <FormField label={t("age")} required error={errors.age?.message}>
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={150}
                    className={FIELD_CLASS}
                    {...register("age", { valueAsNumber: true })}
                  />
                )}
              </FormField>
            )}
            {selectedRole === "voluntario" && (
              <FormField label={t("voluntarioTipo")} required error={errors.volunteerType?.message}>
                {(field) => (
                  <Controller
                    name="volunteerType"
                    control={control}
                    render={({ field: rhf }) => (
                      <Select value={rhf.value ?? ""} onValueChange={(v) => rhf.onChange(v)}>
                        <SelectTrigger
                          id={field.id}
                          aria-invalid={field["aria-invalid"]}
                          aria-describedby={field["aria-describedby"]}
                          className={SELECT_TRIGGER_CLASS}
                        >
                          <SelectValue placeholder={t("voluntarioTipo")}>
                            {(value: string | null) => (value ? volunteerTypeLabels[value] : null)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hospedaje">{t("voluntarioHospedaje")}</SelectItem>
                          <SelectItem value="gestion">{t("voluntarioGestion")}</SelectItem>
                          <SelectItem value="ambos">{t("voluntarioAmbos")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
            )}
            <FormField label={t("password")} required error={errors.password?.message}>
              {(field) => (
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  className={PASSWORD_FIELD_CLASS}
                  {...register("password")}
                />
              )}
            </FormField>
            <FormField label={t("passwordConfirm")} required error={errors.passwordConfirm?.message}>
              {(field) => (
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  className={PASSWORD_FIELD_CLASS}
                  {...register("passwordConfirm")}
                />
              )}
            </FormField>
            <Button type="submit" className={cn("w-full", BUTTON_HEIGHT_CLASS)} disabled={loading} aria-busy={loading}>
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
