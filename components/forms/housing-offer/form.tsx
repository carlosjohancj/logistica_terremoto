"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { housingOfferSchema, HousingOfferValues } from "@/lib/schemas/housing-offer";
import { submitHousingOffer } from "@/lib/forms/submit";
import { AMENITY_TOGGLE_FIELDS, ACCEPT_TOGGLE_FIELDS } from "@/lib/forms/constants";
import { FormSection } from "@/components/forms/shared/form-section";
import { FormField } from "@/components/forms/shared/form-field";
import { FIELD_CLASS, TEXTAREA_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles";
import { cn } from "@/lib/utils";
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

  const amenityToggles = AMENITY_TOGGLE_FIELDS.map(({ field, labelKey }) => ({
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
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="divide-y divide-border">
            <FormSection title={t("locationSection")}>
              <HousingOfferLocationFields
                control={control}
                setValue={setValue}
                stateError={errors.state?.message}
              />
            </FormSection>

            <FormSection title={t("detailsSection")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t("capacity")} required error={errors.capacity?.message}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={1} {...register("capacity")} />
                  )}
                </FormField>
                <FormField label={t("maxStayDays")} error={errors.max_stay_days?.message}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={1} {...register("max_stay_days")} />
                  )}
                </FormField>
              </div>
            </FormSection>

            <FormSection title={t("acceptsSection")}>
              <HousingOfferBooleanToggleGroup control={control} label={t("acceptsSection")} fields={acceptToggles} />
            </FormSection>

            <FormSection title={t("amenitiesSection")}>
              <HousingOfferBooleanToggleGroup control={control} label={t("amenitiesSection")} fields={amenityToggles} />
            </FormSection>

            <FormSection title={t("notes")}>
              <FormField label={t("notes")} hideLabel>
                {(field) => (
                  <Textarea {...field} className={TEXTAREA_CLASS} {...register("notes")} rows={4} />
                )}
              </FormField>
            </FormSection>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              className={cn(BUTTON_HEIGHT_CLASS, "w-full md:w-auto")}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
