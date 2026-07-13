"use client"

import { Control, UseFormSetValue, useWatch } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEstados } from "@/lib/estados"
import { JobValues } from "@/lib/schemas/job"
import { FormField } from "@/components/shared/form-field"

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
      <FormField label={tj("filterState")} error={stateError}>
        {(field) => (
          <Controller
            name="location_state"
            control={control}
            render={({ field: rhf }) => (
              <Select
                value={rhf.value ?? ""}
                onValueChange={(v) => {
                  rhf.onChange(v)
                  setValue("location_city", "")
                }}
              >
                <SelectTrigger
                  id={field.id}
                  aria-invalid={field["aria-invalid"]}
                  aria-describedby={field["aria-describedby"]}
                >
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
        )}
      </FormField>

      <FormField label={tj("location")}>
        {(field) => (
          <Controller
            name="location_city"
            control={control}
            render={({ field: rhf }) => (
              <Select value={rhf.value ?? ""} onValueChange={rhf.onChange} disabled={!selectedEstado}>
                <SelectTrigger id={field.id}>
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
        )}
      </FormField>
    </div>
  )
}
