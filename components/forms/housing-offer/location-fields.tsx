"use client";

import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEstados } from "@/lib/estados";
import { HousingOfferValues } from "@/lib/schemas/housing-offer";
import { FIELD_CLASS, SELECT_TRIGGER_CLASS } from "@/components/shared/field-styles";
import { FormField } from "@/components/shared/form-field";

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
        <FormField label={t("state")} error={stateError}>
          {(field) => (
            <Controller
              name="state"
              control={control}
              render={({ field: rhf }) => (
                <Select
                  value={rhf.value ?? ""}
                  onValueChange={(v) => {
                    rhf.onChange(v);
                    setValue("municipality", "");
                    setValue("city", "");
                  }}
                >
                  <SelectTrigger
                    id={field.id}
                    aria-invalid={field["aria-invalid"]}
                    aria-describedby={field["aria-describedby"]}
                    className={SELECT_TRIGGER_CLASS}
                  >
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
          )}
        </FormField>

        <FormField label={t("municipality")}>
          {(field) => (
            <Controller
              name="municipality"
              control={control}
              render={({ field: rhf }) => (
                <Select
                  value={rhf.value ?? ""}
                  onValueChange={(v) => {
                    rhf.onChange(v);
                    setValue("city", "");
                  }}
                  disabled={!selectedEstado}
                >
                  <SelectTrigger id={field.id} className={SELECT_TRIGGER_CLASS}>
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
          )}
        </FormField>

        <FormField label={t("city")}>
          {(field) => (
            <Controller
              name="city"
              control={control}
              render={({ field: rhf }) => (
                <Select
                  value={rhf.value ?? ""}
                  onValueChange={rhf.onChange}
                  disabled={!selectedEstado || !municipality}
                >
                  <SelectTrigger id={field.id} className={SELECT_TRIGGER_CLASS}>
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
          )}
        </FormField>
      </div>

      <FormField label={t("address")}>
        {(field) => (
          <Controller
            name="address"
            control={control}
            render={({ field: rhf }) => (
              <Input {...rhf} {...field} className={FIELD_CLASS} autoComplete="address-line1" placeholder={t("address")} />
            )}
          />
        )}
      </FormField>
    </div>
  );
}
