"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Gift, PackageSearch } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { getSupabase } from "@/types/supabase"
import type { TablesInsert } from "@/types/database"
import { toast } from "sonner"
import { supplySchema, SupplyValues } from "@/lib/schemas/supply"
import { SUPPLY_CATEGORIES, SUPPLY_CONDITIONS } from "@/lib/forms/constants"
import { FormSection } from "@/components/shared/form-section"
import { OptionCard } from "@/components/shared/option-card"
import { FormField } from "@/components/shared/form-field"
import { RadioCardGroup } from "@/components/shared/radio-card-group"
import {
  FIELD_CLASS,
  SELECT_TRIGGER_CLASS,
  TEXTAREA_CLASS,
  BUTTON_HEIGHT_CLASS,
} from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"
import { SupplyLocationFields } from "./location-fields"

export function SupplyForm() {
  const t = useTranslations("supplies")
  const tc = useTranslations("common")

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

  const supplyType = watch("type")

  async function onSubmit(values: SupplyValues) {
    try {
      const supabase = getSupabase()
      const data: Record<string, unknown> = {
        type: values.type,
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
      if (user) data.user_id = user.id
      if (values.description) data.description = values.description
      if (values.quantity) data.quantity = values.quantity
      if (values.condition) data.condition = values.condition
      if (values.municipality) data.municipality = values.municipality
      if (values.city) data.city = values.city
      if (values.address) data.address = values.address
      if (values.contact_phone) data.contact_phone = values.contact_phone

      if (user) {
        const { error } = await supabase
          .from("supplies")
          .insert(data as TablesInsert<"supplies">)
          .select()
          .single()
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="divide-y divide-border">
            <FormSection title={t("actionSection")}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioCardGroup
                    label={t("actionSection")}
                    error={errors.type?.message}
                    itemsClassName="grid grid-cols-2 gap-3"
                  >
                    <OptionCard
                      role="radio"
                      icon={Gift}
                      title={t("iOffer")}
                      selected={field.value === "offer"}
                      onClick={() => field.onChange("offer")}
                    />
                    <OptionCard
                      role="radio"
                      icon={PackageSearch}
                      title={t("iNeed")}
                      selected={field.value === "request"}
                      onClick={() => field.onChange("request")}
                    />
                  </RadioCardGroup>
                )}
              />
            </FormSection>

            <FormSection title={t("detailsSection")}>
              <FormField label={t("title")} required error={errors.title?.message}>
                {(field) => (
                  <Input
                    {...field}
                    className={FIELD_CLASS}
                    {...register("title")}
                    placeholder={t("titlePlaceholder")}
                  />
                )}
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t("category")} required error={errors.category?.message}>
                  {(field) => (
                    <Controller
                      name="category"
                      control={control}
                      render={({ field: rhf }) => (
                        <Select value={rhf.value ?? ""} onValueChange={rhf.onChange}>
                          <SelectTrigger
                            id={field.id}
                            aria-invalid={field["aria-invalid"]}
                            aria-describedby={field["aria-describedby"]}
                            className={SELECT_TRIGGER_CLASS}
                          >
                            <SelectValue placeholder={t("category")} />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPLY_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {t(c)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
                <FormField label={t("quantity")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={0} {...register("quantity")} />
                  )}
                </FormField>
              </div>

              {supplyType === "offer" && (
                <FormField label={t("condition")}>
                  {(field) => (
                    <Controller
                      name="condition"
                      control={control}
                      render={({ field: rhf }) => (
                        <Select value={rhf.value ?? ""} onValueChange={rhf.onChange}>
                          <SelectTrigger id={field.id} className={SELECT_TRIGGER_CLASS}>
                            <SelectValue placeholder={t("condition")} />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPLY_CONDITIONS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {t(c)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
              )}

              <FormField label={t("description")}>
                {(field) => <Textarea {...field} className={TEXTAREA_CLASS} {...register("description")} rows={4} />}
              </FormField>
            </FormSection>

            <FormSection title={t("location")}>
              <SupplyLocationFields control={control} setValue={setValue} stateError={errors.state?.message} />
              <FormField label={t("address")}>
                {(field) => (
                  <Input {...field} className={FIELD_CLASS} autoComplete="street-address" {...register("address")} />
                )}
              </FormField>
            </FormSection>

            <FormSection title={t("contact")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t("contactName")} required error={errors.contact_name?.message}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} autoComplete="name" {...register("contact_name")} />
                  )}
                </FormField>
                <FormField label={t("contactPhone")}>
                  {(field) => (
                    <Input
                      {...field}
                      className={FIELD_CLASS}
                      type="tel"
                      autoComplete="tel"
                      {...register("contact_phone")}
                    />
                  )}
                </FormField>
              </div>
            </FormSection>

            {supplyType === "offer" && (
              <FormSection title={t("needsTransport")}>
                <Controller
                  name="needs_transport"
                  control={control}
                  render={({ field }) => (
                    <RadioCardGroup label={t("needsTransport")} itemsClassName="flex flex-wrap gap-2">
                      <OptionCard
                        role="radio"
                        title={t("yes")}
                        selected={field.value}
                        onClick={() => field.onChange(true)}
                      />
                      <OptionCard
                        role="radio"
                        title={t("no")}
                        selected={!field.value}
                        onClick={() => field.onChange(false)}
                      />
                    </RadioCardGroup>
                  )}
                />
              </FormSection>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              className={cn(BUTTON_HEIGHT_CLASS, "w-full md:w-auto")}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
