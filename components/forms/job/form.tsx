"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Controller } from "react-hook-form"
import { getSupabase, TABLES } from "@/types/supabase"
import type { TablesInsert } from "@/types/database"
import { toast } from "sonner"
import { jobSchema, JobValues } from "@/lib/schemas/job"
import { JOB_MODALITIES } from "@/lib/forms/constants"
import { JobLocationFields } from "./location-fields"
import { FormField } from "@/components/shared/form-field"

type JobFormProps = {
  companyId: string
  onSuccess: () => void
}

export function JobForm({ companyId, onSuccess }: JobFormProps) {
  const tj = useTranslations("jobs")
  const tc = useTranslations("common")

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location_state: "",
      location_city: "",
      salary_range: "",
      contact_email: "",
    },
  })

  async function onSubmit(values: JobValues) {
    try {
      const supabase = getSupabase()
      await supabase
        .from(TABLES.JOBS)
        .insert({ ...values, company_id: companyId, status: "open" } as TablesInsert<"jobs">)
        .select()
        .single()
      toast.success(tj("success") || "Empleo creado")
      reset()
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{tj("newJob") || "Crear empleo"}</DialogTitle>
        <DialogDescription>{tj("subtitle")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4 py-4">
          <FormField label={tj("title")} required error={errors.title?.message}>
            {(field) => <Input {...field} {...register("title")} />}
          </FormField>
          <FormField label={tj("description") || "Descripción"}>
            {(field) => <Textarea {...field} {...register("description")} rows={3} />}
          </FormField>
          <FormField label={tj("requirements")}>
            {(field) => <Textarea {...field} {...register("requirements")} rows={3} />}
          </FormField>

          <JobLocationFields
            control={control}
            setValue={setValue}
            stateError={errors.location_state?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={tj("modality")} required error={errors.modality?.message}>
              {(field) => (
                <Controller
                  name="modality"
                  control={control}
                  render={({ field: rhf }) => (
                    <Select value={rhf.value ?? ""} onValueChange={rhf.onChange}>
                      <SelectTrigger
                        id={field.id}
                        aria-invalid={field["aria-invalid"]}
                        aria-describedby={field["aria-describedby"]}
                      >
                        <SelectValue placeholder={tj("modality")}>
                          {(value: string | null) => (value ? tj(value as (typeof JOB_MODALITIES)[number]) : tj("modality"))}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_MODALITIES.map((m) => (
                          <SelectItem key={m} value={m}>{tj(m)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>
            <FormField label={tj("salary")}>
              {(field) => <Input {...field} {...register("salary_range")} placeholder="$" />}
            </FormField>
          </div>

          <FormField label={tj("contact")} required error={errors.contact_email?.message}>
            {(field) => (
              <Input {...field} type="email" autoComplete="email" {...register("contact_email")} />
            )}
          </FormField>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? tc("loading") : tc("save")}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
