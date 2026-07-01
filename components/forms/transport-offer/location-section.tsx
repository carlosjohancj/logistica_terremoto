"use client";

import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-2">
        <Label>{t(`${prefix}State`)}</Label>
        <Controller
          name={stateField}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => {
                field.onChange(v);
                setValue(municipalityField, "");
                setValue(cityField, "");
              }}
            >
              <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
        {stateError && <p className="text-sm text-destructive">{stateError}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t(`${prefix}Municipality`)}</Label>
        <Controller
          name={municipalityField}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => {
                field.onChange(v);
                setValue(cityField, "");
              }}
              disabled={!selectedEstado}
            >
              <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
      </div>
      <div className="space-y-2">
        <Label>{t(`${prefix}City`)}</Label>
        <Controller
          name={cityField}
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={!selectedEstado || !municipality}
            >
              <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
      </div>
    </div>
  );
}
