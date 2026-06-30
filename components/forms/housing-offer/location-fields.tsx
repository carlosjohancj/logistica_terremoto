"use client";

import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEstados } from "@/lib/estados";
import { HousingOfferValues } from "@/lib/schemas/housing-offer";

interface LocationFieldsProps {
  control: Control<HousingOfferValues>;
  setValue: UseFormSetValue<HousingOfferValues>;
  stateError?: string;
}

export function HousingOfferLocationFields({
  control,
  setValue,
  stateError,
}: LocationFieldsProps) {
  const t = useTranslations("housingOffer");
  const tc = useTranslations("common");
  const { estados, loading: estadosLoading } = useEstados();

  const selectedStateName = useWatch({ control, name: "state" });
  const municipality = useWatch({ control, name: "municipality" });
  const selectedEstado = estados.find((e) => e.name === selectedStateName);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t("state")}</Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(v) => {
                  field.onChange(v);
                  setValue("municipality", "");
                  setValue("city", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("state")} />
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
          {stateError && (
            <p className="text-sm text-destructive">{stateError}</p>
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
                  field.onChange(v);
                  setValue("city", "");
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
                disabled={!selectedEstado || !municipality}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("city")} />
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
      <div className="space-y-2">
        <Label>{t("address")}</Label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder={t("address")} />
          )}
        />
      </div>
    </div>
  );
}
