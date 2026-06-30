"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
                <div className="space-y-2">
                  <Label>{t("name")}</Label>
                  <Input {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>RIF</Label>
                  <Input {...register("rif")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("sector")}</Label>
                <Controller
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
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
                {errors.sector && (
                  <p className="text-sm text-destructive">{errors.sector.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("description")}</Label>
                <Textarea {...register("description")} rows={4} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("location")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("state")}</Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => {
                          field.onChange(v)
                          setValue("municipality", "")
                          setValue("city", "")
                        }}
                      >
                        <SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label>{t("municipality")}</Label>
                  <Controller
                    name="municipality"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => {
                          field.onChange(v)
                          setValue("city", "")
                        }}
                        disabled={!selectedEstado}
                      >
                        <SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label>{t("city")}</Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={!selectedEstado || !municipalityValue}
                      >
                        <SelectTrigger>
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
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("address")}</Label>
                <Input {...register("address")} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("contact")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("contactName")}</Label>
                  <Input {...register("contact_name")} />
                  {errors.contact_name && (
                    <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("contactPhone")}</Label>
                  <Input {...register("contact_phone")} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("contactEmail")}</Label>
                  <Input type="email" {...register("contact_email")} />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("website")}</Label>
                  <Input type="url" {...register("website")} placeholder="https://" />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
