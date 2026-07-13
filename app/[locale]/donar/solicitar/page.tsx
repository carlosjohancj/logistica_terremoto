"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabase } from "@/types/supabase"
import { HELP_TYPES } from "@/lib/forms/constants"
import { useEstados } from "@/lib/estados"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { familyAidSchema, FamilyAidValues } from "@/lib/schemas/family-aid"
import { FormField } from "@/components/shared/form-field"

export default function SolicitarPage() {
  const f = useTranslations("familyAid")
  const ht = useTranslations("helpTypes")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const { estados } = useEstados()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FamilyAidValues>({
    resolver: zodResolver(familyAidSchema),
    defaultValues: {
      title: "",
      description: "",
      story: "",
      amount: "",
      help_type: "",
      state: "",
      city: "",
    },
  })

  async function onSubmit(values: FamilyAidValues) {
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(tc("authRequired"))
        return
      }

      const res = await fetch("/api/family-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description?.trim() ?? "",
          story: values.story?.trim() ?? "",
          amount_needed: values.amount ? parseFloat(values.amount) : null,
          help_type: values.help_type,
          location_state: values.state || null,
          location_city: values.city || null,
        }),
      })

      if (!res.ok) throw new Error(await res.text())

      toast.success(f("success"))
      router.push(`/${locale}/donar`)
    } catch {
      toast.error(tc("tryAgain"))
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Link
        href={`/${locale}/donar`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {tc("back")}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{f("formTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField label={f("titleLabel")} required error={errors.title?.message}>
              {(field) => (
                <Input {...field} {...register("title")} placeholder={f("titleLabel")} />
              )}
            </FormField>

            <FormField label={f("descriptionLabel")}>
              {(field) => (
                <Textarea {...field} {...register("description")} placeholder={f("descriptionLabel")} rows={3} />
              )}
            </FormField>

            <FormField label={f("storyLabel")}>
              {(field) => (
                <Textarea {...field} {...register("story")} placeholder={f("storyLabel")} rows={4} />
              )}
            </FormField>

            <FormField label={f("amountLabel")}>
              {(field) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("amount")}
                  placeholder={f("amountLabel")}
                />
              )}
            </FormField>

            <FormField label={f("helpTypeLabel")} required error={errors.help_type?.message}>
              {(field) => (
                <Controller
                  name="help_type"
                  control={control}
                  render={({ field: rhf }) => (
                    <Select value={rhf.value} onValueChange={(v) => rhf.onChange(v || "")}>
                      <SelectTrigger
                        id={field.id}
                        aria-invalid={field["aria-invalid"]}
                        aria-describedby={field["aria-describedby"]}
                      >
                        <SelectValue placeholder={tc("select")} />
                      </SelectTrigger>
                      <SelectContent>
                        {HELP_TYPES.map((htype) => (
                          <SelectItem key={htype} value={htype}>{ht(htype)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={f("stateLabel")}>
                {(field) => (
                  <Controller
                    name="state"
                    control={control}
                    render={({ field: rhf }) => (
                      <Select value={rhf.value} onValueChange={(v) => rhf.onChange(v || "")}>
                        <SelectTrigger id={field.id}>
                          <SelectValue placeholder={tc("select")} />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map((est) => (
                            <SelectItem key={est.id} value={est.name}>{est.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField label={f("cityLabel")}>
                {(field) => (
                  <Input {...field} {...register("city")} placeholder={f("cityLabel")} />
                )}
              </FormField>
            </div>

            <Button type="submit" className="w-full rounded-full gap-2" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {f("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
