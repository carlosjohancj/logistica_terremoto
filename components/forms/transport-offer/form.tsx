"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { transportOfferSchema, TransportOfferValues } from "@/lib/schemas/transport-offer";
import { submitTransportOffer } from "@/lib/forms/submit";
import { VEHICLE_TYPES } from "@/lib/forms/constants";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Vehicle type */}
      <div className="space-y-2">
        <Label>{t("vehicleType")}</Label>
        <Controller
          name="vehicle_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map((vt) => (
                <Button
                  key={vt}
                  type="button"
                  variant={field.value === vt ? "default" : "outline"}
                  onClick={() => field.onChange(vt)}
                >
                  {t(vt)}
                </Button>
              ))}
            </div>
          )}
        />
        {errors.vehicle_type && (
          <p className="text-sm text-destructive">{errors.vehicle_type.message}</p>
        )}
      </div>

      {/* Capacity */}
      <div className="space-y-2">
        <Label>{t("capacity")}</Label>
        <Input type="number" min={1} {...register("capacity")} />
        {errors.capacity && (
          <p className="text-sm text-destructive">{errors.capacity.message}</p>
        )}
      </div>

      <TransportLocationSection
        control={control}
        setValue={setValue}
        prefix="origin"
        heading={t("originState")}
        stateError={errors.origin_state?.message}
      />

      <TransportLocationSection
        control={control}
        setValue={setValue}
        prefix="destination"
        heading={t("destinationState")}
      />

      {/* Dates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="flexible_date"
            {...register("flexible_date")}
            className="h-4 w-4"
          />
          <Label htmlFor="flexible_date">Fecha flexible</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Disponible desde</Label>
            <Input type="date" {...register("available_from")} />
          </div>
          <div className="space-y-2">
            <Label>Disponible hasta</Label>
            <Input type="date" {...register("available_until")} />
          </div>
        </div>
      </div>

      {/* Gas donation */}
      <div className="space-y-3">
        <Label>{t("needsGasDonation")}</Label>
        <Controller
          name="needs_gas_donation"
          control={control}
          render={({ field }) => (
            <div className="flex gap-4">
              <Button
                type="button"
                variant={field.value ? "default" : "outline"}
                onClick={() => field.onChange(true)}
              >
                {t("yes")}
              </Button>
              <Button
                type="button"
                variant={!field.value ? "default" : "outline"}
                onClick={() => field.onChange(false)}
              >
                {t("no")}
              </Button>
            </div>
          )}
        />
        {needsGasDonation && (
          <div className="space-y-2">
            <Label>Monto estimado ($)</Label>
            <Input type="number" min={0} {...register("gas_donation_amount")} />
          </div>
        )}
      </div>

      {/* Accepts */}
      <div className="space-y-3">
        <Label>¿Qué ofreces transportar?</Label>
        <div className="flex gap-4">
          <Controller
            name="accepts_passengers"
            control={control}
            render={({ field }) => (
              <Button
                type="button"
                variant={field.value ? "default" : "outline"}
                onClick={() => field.onChange(!field.value)}
              >
                Pasajeros
              </Button>
            )}
          />
          <Controller
            name="accepts_cargo"
            control={control}
            render={({ field }) => (
              <Button
                type="button"
                variant={field.value ? "default" : "outline"}
                onClick={() => field.onChange(!field.value)}
              >
                Carga
              </Button>
            )}
          />
        </div>
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
