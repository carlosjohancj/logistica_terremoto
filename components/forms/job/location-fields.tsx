"use client"

import { Control, UseFormSetValue, useWatch } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEstados } from "@/lib/estados"
import { JobValues } from "@/lib/schemas/job"

interface LocationFieldsProps {
  control: Control<JobValues>
  setValue: UseFormSetValue<JobValues>
  stateError?: string
}

export function JobLocationFields({ control, setValue, stateError }: LocationFieldsProps) {
  const tj = useTranslations("jobs")
  const { estados } = useEstados()

  const locationState = useWatch({ control, name: "location_state" })
  const selectedEstado = estados.find((e) => e.name === locationState)

  return (
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
        {stateError && <p className="text-sm text-destructive">{stateError}</p>}
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
  )
}
