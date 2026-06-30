"use client";

import { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {fields.map(({ field, label: fieldLabel }) => (
          <Controller
            key={field}
            name={field}
            control={control}
            render={({ field: f }) => (
              <Button
                type="button"
                variant={(f.value as boolean) ? "default" : "outline"}
                onClick={() => f.onChange(!(f.value as boolean))}
              >
                {fieldLabel}
              </Button>
            )}
          />
        ))}
      </div>
    </div>
  );
}
