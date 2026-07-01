"use client";

import { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { OptionCard } from "@/components/forms/shared/option-card";
import { BooleanToggleField, HousingOfferValues } from "@/lib/schemas/housing-offer";

interface BooleanToggleGroupProps {
  control: Control<HousingOfferValues>;
  label?: string;
  fields: Array<{ field: BooleanToggleField; label: string }>;
}

export function HousingOfferBooleanToggleGroup({
  control,
  label,
  fields,
}: BooleanToggleGroupProps) {
  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  );
}
