"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { getSupabase } from "@/lib/supabase"
import { useEstados } from "@/lib/estados"
import { companySchema, CompanyValues } from "@/lib/schemas/company"
import { FormField } from "@/components/forms/shared/form-field"

export default function RegistroEmpresaPage() {
  const t = useTranslations("companies")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const { estados, loading: estadosLoading } = useEstados()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      rif: "",
      sector: "",
      state: "",
      municipality: "",
      city: "",
      address: "",
      description: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      website: "",
    },
  })

  const selectedStateName = watch("state")
  const municipalityValue = watch("municipality")
  const selectedEstado = estados.find((e) => e.name === selectedStateName)

  async function onSubmit(values: CompanyValues) {
    try {
      const supabase = getSupabase()
      const data: Record<string, unknown> = {
        ...values,
        verified: false,
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) data.user = user.id
      const { error } = await supabase.from("companies").insert(data).select().single()
      if (error) throw error
      toast.success(t("success"))
      router.push(`/${locale}/empleos`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("register")}</CardTitle>
          <CardDescription>{t("registerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">{t("companyInfo")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t("name")} required error={errors.name?.message}>
                  {(field) => <Input {...field} autoComplete="organization" {...register("name")} />}
                </FormField>
                <FormField label="RIF">
                  {(field) => <Input {...field} {...register("rif")} />}
                </FormField>
              </div>
              <FormField label={t("sector")} error={errors.sector?.message}>
                {(field) => (
                  <Controller
                    name="sector"
                    control={control}
                    render={({ field: rhf }) => (
                      <Select value={rhf.value ?? ""} onValueChange={rhf.onChange}>
                        <SelectTrigger
                          id={field.id}
                          aria-invalid={field["aria-invalid"]}
                          aria-describedby={field["aria-describedby"]}
                        >
                          <SelectValue placeholder={t("sector")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnologia">Tecnología</SelectItem>
                          <SelectItem value="salud">Salud</SelectItem>
                          <SelectItem value="educacion">Educación</SelectItem>
                          <SelectItem value="construccion">Construcción</SelectItem>
                          <SelectItem value="comercio">Comercio</SelectItem>
                          <SelectItem value="transporte">Transporte</SelectItem>
                          <SelectItem value="alimentacion">Alimentación</SelectItem>
                          <SelectItem value="servicios">Servicios</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField label={t("description")}>
                {(field) => <Textarea {...field} {...register("description")} rows={4} />}
              </FormField>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("location")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label={t("state")}>
                  {(field) => (
                    <Controller
                      name="state"
                      control={control}
                      render={({ field: rhf }) => (
                        <Select
                          value={rhf.value ?? ""}
                          onValueChange={(v) => {
                            rhf.onChange(v)
                            setValue("municipality", "")
                            setValue("city", "")
                          }}
                        >
                          <SelectTrigger id={field.id}>
                            <SelectValue placeholder={t("state")} />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosLoading ? (
                              <SelectItem value="" disabled>
                                {tc("loading")}
                              </SelectItem>
                            ) : (
                              estados.map((e) => (
                                <SelectItem key={e.name} value={e.name}>
                                  {e.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
                <FormField label={t("municipality")}>
                  {(field) => (
                    <Controller
                      name="municipality"
                      control={control}
                      render={({ field: rhf }) => (
                        <Select
                          value={rhf.value ?? ""}
                          onValueChange={(v) => {
                            rhf.onChange(v)
                            setValue("city", "")
                          }}
                          disabled={!selectedEstado}
                        >
                          <SelectTrigger id={field.id}>
                            <SelectValue placeholder={t("municipality")} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedEstado?.municipios.map((m) => (
                              <SelectItem key={m.municipio} value={m.municipio}>
                                {m.municipio}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
                <FormField label={t("city")}>
                  {(field) => (
                    <Controller
                      name="city"
                      control={control}
                      render={({ field: rhf }) => (
                        <Select
                          value={rhf.value ?? ""}
                          onValueChange={rhf.onChange}
                          disabled={!selectedEstado || !municipalityValue}
                        >
                          <SelectTrigger id={field.id}>
                            <SelectValue placeholder={t("city")} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedEstado?.municipios
                              .find((m) => m.municipio === municipalityValue)
                              ?.ciudades.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
              </div>
              <FormField label={t("address")}>
                {(field) => <Input {...field} autoComplete="street-address" {...register("address")} />}
              </FormField>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("contact")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t("contactName")} required error={errors.contact_name?.message}>
                  {(field) => <Input {...field} autoComplete="name" {...register("contact_name")} />}
                </FormField>
                <FormField label={t("contactPhone")}>
                  {(field) => <Input {...field} type="tel" autoComplete="tel" {...register("contact_phone")} />}
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t("contactEmail")} required error={errors.contact_email?.message}>
                  {(field) => (
                    <Input {...field} type="email" autoComplete="email" {...register("contact_email")} />
                  )}
                </FormField>
                <FormField label={t("website")} error={errors.website?.message}>
                  {(field) => (
                    <Input
                      {...field}
                      type="url"
                      autoComplete="url"
                      {...register("website")}
                      placeholder="https://"
                    />
                  )}
                </FormField>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
