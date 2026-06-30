"use client"

import { useForm } from "react-hook-form"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Controller } from "react-hook-form"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { jobSchema, JobValues } from "@/lib/schemas/job"
import { JOB_MODALITIES } from "@/lib/forms/constants"
import { JobLocationFields } from "./location-fields"

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
        .insert({ ...values, company: companyId, status: "open" })
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{tj("title")}</Label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{tj("description") || "Descripción"}</Label>
            <Textarea {...register("description")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>{tj("requirements")}</Label>
            <Textarea {...register("requirements")} rows={3} />
          </div>

          <JobLocationFields
            control={control}
            setValue={setValue}
            stateError={errors.location_state?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tj("modality")}</Label>
              <Controller
                name="modality"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={tj("modality")} />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_MODALITIES.map((m) => (
                        <SelectItem key={m} value={m}>{tj(m)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.modality && (
                <p className="text-sm text-destructive">{errors.modality.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{tj("salary")}</Label>
              <Input {...register("salary_range")} placeholder="$" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tj("contact")}</Label>
            <Input type="email" {...register("contact_email")} />
            {errors.contact_email && (
              <p className="text-sm text-destructive">{errors.contact_email.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? tc("loading") : tc("save")}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
