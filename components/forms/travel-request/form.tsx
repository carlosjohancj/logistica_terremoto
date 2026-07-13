"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { travelRequestSchema, TravelRequestValues } from "@/lib/schemas/travel-request";
import { submitTravelRequest } from "@/lib/forms/submit";
import { HOUSING_DESTRUCTION_OPTIONS } from "@/lib/forms/constants";
import { FormSection } from "@/components/forms/shared/form-section";
import { OptionCard } from "@/components/forms/shared/option-card";
import { FormField } from "@/components/forms/shared/form-field";
import { RadioCardGroup } from "@/components/forms/shared/radio-card-group";
import { FIELD_CLASS, SELECT_TRIGGER_CLASS, TEXTAREA_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles";
import { cn } from "@/lib/utils";
import { TravelLocationSection } from "./location-section";

export function TravelRequestForm() {
  const t = useTranslations("travelRequest");
  const tc = useTranslations("common");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TravelRequestValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      has_destination: null,
      origin_state: "",
      origin_municipality: "",
      origin_city: "",
      destination_state: "",
      destination_municipality: "",
      destination_city: "",
      notes: "",
    },
  });

  const registrantType = watch("registrant_type");
  const hasDestination = watch("has_destination");

  async function onSubmit(values: TravelRequestValues) {
    try {
      await submitTravelRequest(values);
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
            <FormSection title={t("registrantType")}>
              <Controller
                name="registrant_type"
                control={control}
                render={({ field }) => (
                  <RadioCardGroup label={t("registrantType")} error={errors.registrant_type?.message}>
                    <OptionCard
                      role="radio"
                      icon={Users}
                      title={t("registrantDamnificado")}
                      selected={field.value === "damnificado"}
                      onClick={() => field.onChange("damnificado")}
                    />
                    <OptionCard
                      role="radio"
                      icon={UserPlus}
                      title={t("registrantColaborador")}
                      selected={field.value === "colaborador"}
                      onClick={() => field.onChange("colaborador")}
                    />
                  </RadioCardGroup>
                )}
              />

              {registrantType === "colaborador" && (
                <FormField label={t("registrantRelation")}>
                  {(field) => (
                    <Input
                      {...field}
                      className={FIELD_CLASS}
                      autoComplete="off"
                      {...register("registrant_relation")}
                      placeholder={t("registrantRelation")}
                    />
                  )}
                </FormField>
              )}
            </FormSection>

            <FormSection title={t("originSection")}>
              <TravelLocationSection
                control={control}
                setValue={setValue}
                prefix="origin"
                stateError={errors.origin_state?.message}
              />

              <Controller
                name="has_destination"
                control={control}
                render={({ field }) => (
                  <RadioCardGroup label={t("hasDestination")} itemsClassName="flex flex-wrap gap-2">
                    <OptionCard
                      role="radio"
                      title={t("yes")}
                      selected={field.value === true}
                      onClick={() => field.onChange(true)}
                    />
                    <OptionCard
                      role="radio"
                      title={t("no")}
                      selected={field.value === false}
                      onClick={() => field.onChange(false)}
                    />
                  </RadioCardGroup>
                )}
              />
            </FormSection>

            {hasDestination === true && (
              <FormSection title={t("destinationSection")}>
                <TravelLocationSection
                  control={control}
                  setValue={setValue}
                  prefix="destination"
                />
              </FormSection>
            )}

            <FormSection title={t("tripDetailsSection")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t("peopleToMove")} required error={errors.people_to_move?.message}>
                  {(field) => (
                    <Input
                      {...field}
                      className={FIELD_CLASS}
                      type="number"
                      min={1}
                      {...register("people_to_move")}
                    />
                  )}
                </FormField>
                <FormField label={t("peopleToHouse")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={0} {...register("people_to_house")} />
                  )}
                </FormField>
                <FormField label={t("childrenCount")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={0} {...register("children_count")} />
                  )}
                </FormField>
                <FormField label={t("adultsCount")}>
                  {(field) => (
                    <Input {...field} className={FIELD_CLASS} type="number" min={0} {...register("adults_count")} />
                  )}
                </FormField>
              </div>

              <FormField
                label={t("housingDestruction")}
                required
                error={errors.housing_destruction?.message}
              >
                {(field) => (
                  <Controller
                    name="housing_destruction"
                    control={control}
                    render={({ field: rhf }) => (
                      <Select value={rhf.value ?? ""} onValueChange={rhf.onChange}>
                        <SelectTrigger
                          id={field.id}
                          aria-invalid={field["aria-invalid"]}
                          aria-describedby={field["aria-describedby"]}
                          className={SELECT_TRIGGER_CLASS}
                        >
                          <SelectValue placeholder={t("housingDestruction")} />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUSING_DESTRUCTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {t(opt)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
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
