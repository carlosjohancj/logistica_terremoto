"use client";

import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEstados } from "@/lib/estados";
import { TransportOfferValues } from "@/lib/schemas/transport-offer";
import { SELECT_TRIGGER_CLASS } from "@/components/shared/field-styles";
import { FormField } from "@/components/forms/shared/form-field";

type LocationPrefix = "origin" | "destination";

interface LocationSectionProps {
  control: Control<TransportOfferValues>;
  setValue: UseFormSetValue<TransportOfferValues>;
  prefix: LocationPrefix;
  stateError?: string;
}

export function TransportLocationSection({
  control,
  setValue,
  prefix,
  stateError,
}: LocationSectionProps) {
  const tc = useTranslations("common");
  const t = useTranslations("transportOffer");
  const { estados, loading: estadosLoading } = useEstados();

  const stateField = `${prefix}_state` as const;
  const municipalityField = `${prefix}_municipality` as const;
  const cityField = `${prefix}_city` as const;

  const stateName = useWatch({ control, name: stateField });
  const municipality = useWatch({ control, name: municipalityField });
  const selectedEstado = estados.find((e) => e.name === stateName);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label={t(`${prefix}State`)} error={stateError}>
        {(field) => (
          <Controller
            name={stateField}
            control={control}
            render={({ field: rhf }) => (
              <Select
                value={rhf.value ?? ""}
                onValueChange={(v) => {
                  rhf.onChange(v);
                  setValue(municipalityField, "");
                  setValue(cityField, "");
                }}
              >
                <SelectTrigger
                  id={field.id}
                  aria-invalid={field["aria-invalid"]}
                  aria-describedby={field["aria-describedby"]}
                  className={SELECT_TRIGGER_CLASS}
                >
                  <SelectValue placeholder={t(`${prefix}State`)} />
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

      <FormField label={t(`${prefix}Municipality`)}>
        {(field) => (
          <Controller
            name={municipalityField}
            control={control}
            render={({ field: rhf }) => (
              <Select
                value={rhf.value ?? ""}
                onValueChange={(v) => {
                  rhf.onChange(v);
                  setValue(cityField, "");
                }}
                disabled={!selectedEstado}
              >
                <SelectTrigger id={field.id} className={SELECT_TRIGGER_CLASS}>
                  <SelectValue placeholder={t(`${prefix}Municipality`)} />
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

      <FormField label={t(`${prefix}City`)}>
        {(field) => (
          <Controller
            name={cityField}
            control={control}
            render={({ field: rhf }) => (
              <Select
                value={rhf.value ?? ""}
                onValueChange={rhf.onChange}
                disabled={!selectedEstado || !municipality}
              >
                <SelectTrigger id={field.id} className={SELECT_TRIGGER_CLASS}>
                  <SelectValue placeholder={t(`${prefix}City`)} />
                </SelectTrigger>
                <SelectContent>
                  {selectedEstado?.municipios
                    .find((m) => m.municipio === municipality)
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
  );
}
