"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FIELD_CLASS, SELECT_TRIGGER_CLASS, TEXTAREA_CLASS } from "@/components/forms/shared/field-styles";
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="divide-y divide-border">
            <FormSection title={t("registrantType")}>
              <Controller
                name="registrant_type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <OptionCard
                      icon={Users}
                      title={t("registrantDamnificado")}
                      selected={field.value === "damnificado"}
                      onClick={() => field.onChange("damnificado")}
                    />
                    <OptionCard
                      icon={UserPlus}
                      title={t("registrantColaborador")}
                      selected={field.value === "colaborador"}
                      onClick={() => field.onChange("colaborador")}
                    />
                  </div>
                )}
              />
              {errors.registrant_type && (
                <p className="text-sm text-destructive">{errors.registrant_type.message}</p>
              )}

              {registrantType === "colaborador" && (
                <div className="space-y-2">
                  <Label>{t("registrantRelation")}</Label>
                  <Input
                    className={FIELD_CLASS}
                    {...register("registrant_relation")}
                    placeholder={t("registrantRelation")}
                  />
                </div>
              )}
            </FormSection>

            <FormSection title={t("originSection")}>
              <TravelLocationSection
                control={control}
                setValue={setValue}
                prefix="origin"
                stateError={errors.origin_state?.message}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Label className="text-sm font-medium">{t("hasDestination")}</Label>
                <Controller
                  name="has_destination"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      <OptionCard
                        title={t("yes")}
                        selected={field.value === true}
                        onClick={() => field.onChange(true)}
                      />
                      <OptionCard
                        title={t("no")}
                        selected={field.value === false}
                        onClick={() => field.onChange(false)}
                      />
                    </div>
                  )}
                />
              </div>
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
                <div className="space-y-2">
                  <Label>{t("peopleToMove")}</Label>
                  <Input
                    className={FIELD_CLASS}
                    type="number"
                    min={1}
                    {...register("people_to_move")}
                  />
                  {errors.people_to_move && (
                    <p className="text-sm text-destructive">{errors.people_to_move.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("peopleToHouse")}</Label>
                  <Input className={FIELD_CLASS} type="number" min={0} {...register("people_to_house")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("childrenCount")}</Label>
                  <Input className={FIELD_CLASS} type="number" min={0} {...register("children_count")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("adultsCount")}</Label>
                  <Input className={FIELD_CLASS} type="number" min={0} {...register("adults_count")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("housingDestruction")}</Label>
                <Controller
                  name="housing_destruction"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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
                {errors.housing_destruction && (
                  <p className="text-sm text-destructive">{errors.housing_destruction.message}</p>
                )}
              </div>
            </FormSection>

            <FormSection title={t("notes")}>
              <Textarea className={TEXTAREA_CLASS} {...register("notes")} rows={4} />
            </FormSection>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
