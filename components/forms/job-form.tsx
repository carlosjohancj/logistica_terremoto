"use client"

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { useEstados } from "@/lib/estados"
import { jobSchema, JobValues } from "@/lib/schemas/job"

type JobFormProps = {
  companyId: string
  onSuccess: () => void
}

export function JobForm({ companyId, onSuccess }: JobFormProps) {
  const tj = useTranslations("jobs")
  const tc = useTranslations("common")
  const { estados } = useEstados()

  const {
    register,
    control,
    handleSubmit,
    watch,
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

  const locationState = watch("location_state")
  const selectedEstado = estados.find((e) => e.name === locationState)

  async function onSubmit(values: JobValues) {
    try {
      const supabase = getSupabase()
      await supabase
        .from(TABLES.JOBS)
        .insert({
          ...values,
          company: companyId,
          status: "open",
        })
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tj("filterState")}</Label>
              <Controller
                name="location_state"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => {
                      field.onChange(v)
                      setValue("location_city", "")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tj("filterState")} />
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
              {errors.location_state && (
                <p className="text-sm text-destructive">{errors.location_state.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{tj("location")}</Label>
              <Controller
                name="location_city"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={!selectedEstado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tj("location")} />
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
          </div>
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
                      <SelectItem value="presencial">{tj("presencial")}</SelectItem>
                      <SelectItem value="remoto">{tj("remoto")}</SelectItem>
                      <SelectItem value="hibrido">{tj("hibrido")}</SelectItem>
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
