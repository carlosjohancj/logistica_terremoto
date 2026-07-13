"use client";

import { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { OptionCard } from "@/components/shared/option-card";
import { ToggleCardGroup } from "@/components/shared/toggle-card-group";
import { BooleanToggleField, HousingOfferValues } from "@/lib/schemas/housing-offer";

interface BooleanToggleGroupProps {
  control: Control<HousingOfferValues>;
  label: string;
  fields: Array<{ field: BooleanToggleField; label: string }>;
}

export function HousingOfferBooleanToggleGroup({
  control,
  label,
  fields,
}: BooleanToggleGroupProps) {
  return (
    <ToggleCardGroup label={label}>
      {fields.map(({ field, label: fieldLabel }) => (
        <Controller
          key={field}
          name={field}
          control={control}
          render={({ field: f }) => (
            <OptionCard
              title={fieldLabel}
              selected={f.value as boolean}
              onClick={() => f.onChange(!(f.value as boolean))}
            />
          )}
        />
      ))}
    </ToggleCardGroup>
  );
}
