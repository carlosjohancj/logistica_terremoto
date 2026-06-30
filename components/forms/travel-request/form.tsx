"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Registrant type */}
      <div className="space-y-3">
        <Label>{t("registrantType")}</Label>
        <Controller
          name="registrant_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={field.value === "damnificado" ? "default" : "outline"}
                onClick={() => field.onChange("damnificado")}
              >
                {t("registrantDamnificado")}
              </Button>
              <Button
                type="button"
                variant={field.value === "colaborador" ? "default" : "outline"}
                onClick={() => field.onChange("colaborador")}
              >
                {t("registrantColaborador")}
              </Button>
            </div>
          )}
        />
        {errors.registrant_type && (
          <p className="text-sm text-destructive">{errors.registrant_type.message}</p>
        )}
      </div>

      {registrantType === "colaborador" && (
        <div className="space-y-2">
          <Label>{t("registrantRelation")}</Label>
          <Input
            {...register("registrant_relation")}
            placeholder={t("registrantRelation")}
          />
        </div>
      )}

      <TravelLocationSection
        control={control}
        setValue={setValue}
        prefix="origin"
        heading={t("originState")}
        stateError={errors.origin_state?.message}
      />

      {/* Has destination */}
      <div className="space-y-3">
        <Label>{t("hasDestination")}</Label>
        <Controller
          name="has_destination"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={field.value === true ? "default" : "outline"}
                onClick={() => field.onChange(true)}
              >
                {t("yes")}
              </Button>
              <Button
                type="button"
                variant={field.value === false ? "default" : "outline"}
                onClick={() => field.onChange(false)}
              >
                {t("no")}
              </Button>
            </div>
          )}
        />
      </div>

      {hasDestination === true && (
        <TravelLocationSection
          control={control}
          setValue={setValue}
          prefix="destination"
          heading={t("destinationState")}
        />
      )}

      {/* People */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("peopleToMove")}</Label>
            <Input type="number" min={1} {...register("people_to_move")} />
            {errors.people_to_move && (
              <p className="text-sm text-destructive">{errors.people_to_move.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("peopleToHouse")}</Label>
            <Input type="number" min={0} {...register("people_to_house")} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("childrenCount")}</Label>
            <Input type="number" min={0} {...register("children_count")} />
          </div>
          <div className="space-y-2">
            <Label>{t("adultsCount")}</Label>
            <Input type="number" min={0} {...register("adults_count")} />
          </div>
        </div>
      </div>

      {/* Housing destruction */}
      <div className="space-y-2">
        <Label>{t("housingDestruction")}</Label>
        <Controller
          name="housing_destruction"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
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

      {/* Notes */}
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
