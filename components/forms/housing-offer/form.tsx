"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { housingOfferSchema, HousingOfferValues } from "@/lib/schemas/housing-offer";
import { submitHousingOffer } from "@/lib/forms/submit";
import { AMENITY_TOGGLES, ACCEPT_TOGGLE_FIELDS } from "@/lib/forms/constants";
import { HousingOfferLocationFields } from "./location-fields";
import { HousingOfferBooleanToggleGroup } from "./boolean-toggle-group";

export function HousingOfferForm() {
  const t = useTranslations("housingOffer");
  const tc = useTranslations("common");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HousingOfferValues>({
    resolver: zodResolver(housingOfferSchema),
    defaultValues: {
      state: "",
      municipality: "",
      city: "",
      address: "",
      accepts_children: false,
      accepts_adults: false,
      accepts_families: false,
      has_furniture: false,
      has_kitchen: false,
      has_bathroom: false,
      notes: "",
    },
  });

  const acceptToggles = ACCEPT_TOGGLE_FIELDS.map(({ field, labelKey }) => ({
    field,
    label: t(labelKey),
  }));

  async function onSubmit(values: HousingOfferValues) {
    try {
      await submitHousingOffer(values);
      toast.success(t("success"));
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <HousingOfferLocationFields
        control={control}
        setValue={setValue}
        stateError={errors.state?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("capacity")}</Label>
          <Input type="number" min={1} {...register("capacity")} />
          {errors.capacity && (
            <p className="text-sm text-destructive">{errors.capacity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t("maxStayDays")}</Label>
          <Input type="number" min={1} {...register("max_stay_days")} />
          {errors.max_stay_days && (
            <p className="text-sm text-destructive">{errors.max_stay_days.message}</p>
          )}
        </div>
      </div>

      <HousingOfferBooleanToggleGroup
        control={control}
        label="¿A quién aceptas?"
        fields={acceptToggles}
      />

      <HousingOfferBooleanToggleGroup
        control={control}
        label="Servicios del lugar"
        fields={AMENITY_TOGGLES}
      />

      <div className="space-y-2">
        <Label>{t("notes")}</Label>
        <Textarea {...register("notes")} rows={4} />
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
        {isSubmitting ? tc("loading") : t("submit")}
      </Button>
    </form>
  );
}
