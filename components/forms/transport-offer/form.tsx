"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { transportOfferSchema, TransportOfferValues } from "@/lib/schemas/transport-offer";
import { submitTransportOffer } from "@/lib/forms/submit";
import { VEHICLE_TYPES } from "@/lib/forms/constants";
import { FormSection } from "@/components/forms/shared/form-section";
import { OptionCard } from "@/components/forms/shared/option-card";
import { FormField } from "@/components/forms/shared/form-field";
import { RadioCardGroup } from "@/components/forms/shared/radio-card-group";
import { ToggleCardGroup } from "@/components/forms/shared/toggle-card-group";
import { FIELD_CLASS, TEXTAREA_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles";
import { cn } from "@/lib/utils";
import { TransportLocationSection } from "./location-section";

export function TransportOfferForm() {
  const t = useTranslations("transportOffer");
  const tc = useTranslations("common");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransportOfferValues>({
    resolver: zodResolver(transportOfferSchema),
    defaultValues: {
      origin_state: "",
      origin_municipality: "",
      origin_city: "",
      destination_state: "",
      destination_municipality: "",
      destination_city: "",
      available_from: "",
      available_until: "",
      flexible_date: false,
      needs_gas_donation: false,
      accepts_passengers: false,
      accepts_cargo: false,
      notes: "",
    },
  });

  const needsGasDonation = watch("needs_gas_donation");

  async function onSubmit(values: TransportOfferValues) {
    try {
      await submitTransportOffer(values);
      toast.success(t("success"));
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"));
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="divide-y divide-border">
            <FormSection title={t("vehicleSection")}>
              <Controller
                name="vehicle_type"
                control={control}
                render={({ field }) => (
                  <RadioCardGroup
                    label={t("vehicleType")}
                    error={errors.vehicle_type?.message}
                    itemsClassName="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  >
                    {VEHICLE_TYPES.map((vt) => (
                      <OptionCard
                        key={vt}
                        role="radio"
                        title={t(vt)}
                        selected={field.value === vt}
                        onClick={() => field.onChange(vt)}
                      />
                    ))}
                  </RadioCardGroup>
                )}
              />

              <FormField label={t("capacity")} required error={errors.capacity?.message}>
                {(field) => (
                  <Input {...field} className={FIELD_CLASS} type="number" min={1} {...register("capacity")} />
                )}
              </FormField>
            </FormSection>

            <FormSection title={t("originSection")}>
              <TransportLocationSection
                control={control}
                setValue={setValue}
                prefix="origin"
                stateError={errors.origin_state?.message}
              />
            </FormSection>

            <FormSection title={t("destinationSection")}>
              <TransportLocationSection
                control={control}
                setValue={setValue}
                prefix="destination"
              />
            </FormSection>

            <FormSection title={t("availabilitySection")}>
              <Controller
                name="flexible_date"
                control={control}
                render={({ field }) => (
                  <RadioCardGroup label={t("flexibleDate")} itemsClassName="flex flex-wrap gap-2">
                    <OptionCard
                      role="radio"
                      title={t("yes")}
                      selected={field.value}
                      onClick={() => field.onChange(true)}
                    />
                    <OptionCard
                      role="radio"
                      title={t("no")}
                      selected={!field.value}
                      onClick={() => field.onChange(false)}
                    />
                  </RadioCardGroup>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t("availableFrom")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="date" {...register("available_from")} />
                  )}
                </FormField>
                <FormField label={t("availableUntil")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="date" {...register("available_until")} />
                  )}
                </FormField>
              </div>
            </FormSection>

            <FormSection title={t("preferencesSection")}>
              <Controller
                name="needs_gas_donation"
                control={control}
                render={({ field }) => (
                  <RadioCardGroup label={t("needsGasDonation")} itemsClassName="flex flex-wrap gap-2">
                    <OptionCard
                      role="radio"
                      title={t("yes")}
                      selected={field.value}
                      onClick={() => field.onChange(true)}
                    />
                    <OptionCard
                      role="radio"
                      title={t("no")}
                      selected={!field.value}
                      onClick={() => field.onChange(false)}
                    />
                  </RadioCardGroup>
                )}
              />
              {needsGasDonation && (
                <FormField label={t("gasDonationAmount")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={0} {...register("gas_donation_amount")} />
                  )}
                </FormField>
              )}

              <ToggleCardGroup label={t("whatToTransport")} itemsClassName="flex flex-wrap gap-2">
                <Controller
                  name="accepts_passengers"
                  control={control}
                  render={({ field }) => (
                    <OptionCard
                      title={t("acceptsPassengers")}
                      selected={field.value}
                      onClick={() => field.onChange(!field.value)}
                    />
                  )}
                />
                <Controller
                  name="accepts_cargo"
                  control={control}
                  render={({ field }) => (
                    <OptionCard
                      title={t("acceptsCargo")}
                      selected={field.value}
                      onClick={() => field.onChange(!field.value)}
                    />
                  )}
                />
              </ToggleCardGroup>
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
