"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
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
import { getSupabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useEstados } from "@/lib/estados"
import { supplySchema, SupplyValues } from "@/lib/schemas/supply"

const CATEGORIES = ["camas", "comida", "ropa", "medicinas", "agua", "higiene", "electronico", "materiales", "muebles", "otros"] as const
const CONDITIONS = ["nuevo", "usado_bueno", "usado_regular", "no_aplica"] as const

export default function OfrecerInsumosPage() {
  const t = useTranslations("supplies")
  const tc = useTranslations("common")

  const [supplyType, setSupplyType] = useState<"offer" | "request" | null>(null)
  const { estados } = useEstados()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplyValues>({
    resolver: zodResolver(supplySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      condition: "",
      state: "",
      municipality: "",
      city: "",
      address: "",
      contact_name: "",
      contact_phone: "",
      needs_transport: false,
    },
  })

  const selectedStateName = watch("state")
  const municipalityValue = watch("municipality")
  const selectedEstado = estados.find((e) => e.name === selectedStateName)

  async function onSubmit(values: SupplyValues) {
    if (!supplyType) return
    try {
      const supabase = getSupabase()
      const data: Record<string, unknown> = {
        type: supplyType,
        title: values.title,
        category: values.category,
        state: values.state,
        contact_name: values.contact_name,
        status: "open",
        needs_transport: values.needs_transport,
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) data.user = user.id
      if (values.description) data.description = values.description
      if (values.quantity) data.quantity = values.quantity
      if (values.condition) data.condition = values.condition
      if (values.municipality) data.municipality = values.municipality
      if (values.city) data.city = values.city
      if (values.address) data.address = values.address
      if (values.contact_phone) data.contact_phone = values.contact_phone

      if (user) {
        const { error } = await supabase.from("supplies").insert(data).select().single()
        if (error) throw error
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "supply", data }),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || tc("error"))
        }
      }

      toast.success(t("success"))
      reset()
      setSupplyType(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  if (!supplyType) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full" onClick={() => setSupplyType("offer")}>
              {t("iOffer")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setSupplyType("request")}
            >
              {t("iNeed")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {supplyType === "offer" ? t("iOffer") : t("iNeed")}
          </CardTitle>
          <CardDescription>{t("fillForm")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>{t("title")}</Label>
              <Input {...register("title")} placeholder={t("titlePlaceholder")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {t(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("quantity")}</Label>
                <Input type="number" min={0} {...register("quantity")} />
              </div>
            </div>

            {supplyType === "offer" && (
              <div className="space-y-2">
                <Label>{t("condition")}</Label>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("condition")} />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {t(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Textarea {...register("description")} rows={4} />
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
                          {estados.map((e) => (
                            <SelectItem key={e.name} value={e.name}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state.message}</p>
                  )}
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
            </div>

            {supplyType === "offer" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needs_transport"
                  {...register("needs_transport")}
                  className="h-4 w-4"
                />
                <Label htmlFor="needs_transport">{t("needsTransport")}</Label>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
