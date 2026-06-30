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
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEstados } from "@/lib/estados";
import { transportOfferSchema, TransportOfferValues } from "@/lib/schemas/transport-offer";

const VEHICLE_TYPES = ["moto", "carro", "camioneta", "camion"] as const;

export function TransportOfferForm() {
  const t = useTranslations("transportOffer");
  const tc = useTranslations("common");
  const { estados, loading: estadosLoading } = useEstados();

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

  const originState = watch("origin_state");
  const originMunicipality = watch("origin_municipality");
  const destState = watch("destination_state");
  const destMunicipality = watch("destination_municipality");
  const needsGasDonation = watch("needs_gas_donation");

  const originEstado = estados.find((e) => e.name === originState);
  const destEstado = estados.find((e) => e.name === destState);

  async function onSubmit(values: TransportOfferValues) {
    try {
      const supabase = getSupabase();

      const data: Record<string, unknown> = {
        vehicle_type: values.vehicle_type,
        capacity: values.capacity,
        origin_state: values.origin_state,
        origin_municipality: values.origin_municipality,
        origin_city: values.origin_city,
        destination_state: values.destination_state,
        destination_municipality: values.destination_municipality,
        destination_city: values.destination_city,
        status: "open",
        flexible_date: values.flexible_date,
        needs_gas_donation: values.needs_gas_donation,
        accepts_passengers: values.accepts_passengers,
        accepts_cargo: values.accepts_cargo,
      };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) data.user = user.id;

      if (values.available_from)
        data.available_from = new Date(values.available_from).toISOString();
      if (values.available_until)
        data.available_until = new Date(values.available_until).toISOString();
      if (values.gas_donation_amount)
        data.gas_donation_amount = values.gas_donation_amount;
      if (values.notes) data.notes = values.notes;

      if (user) {
        const { error } = await supabase
          .from("transport_offers")
          .insert(data)
          .select()
          .single();
        if (error) throw error;
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "transport_offer", data }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || tc("error"));
        }
      }

      toast.success(t("success"));
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error");
      toast.error(msg);
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

      {/* Origin */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t("originState")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("originState")}</Label>
            <Controller
              name="origin_state"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("origin_municipality", "");
                    setValue("origin_city", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("originState")} />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosLoading ? (
                      <SelectItem value="" disabled>
                        {tc("loading")}
                      </SelectItem>
                    ) : (
                      estados.map((e) => (
                        <SelectItem key={e.name} value={e.name}>
                          {e.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.origin_state && (
              <p className="text-sm text-destructive">{errors.origin_state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("originMunicipality")}</Label>
            <Controller
              name="origin_municipality"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("origin_city", "");
                  }}
                  disabled={!originEstado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("originMunicipality")} />
                  </SelectTrigger>
                  <SelectContent>
                    {originEstado?.municipios.map((m) => (
                      <SelectItem key={m.municipio} value={m.municipio}>
                        {m.municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("originCity")}</Label>
            <Controller
              name="origin_city"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={!originEstado || !originMunicipality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("originCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {originEstado?.municipios
                      .find((m) => m.municipio === originMunicipality)
                      ?.ciudades.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t("destinationState")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("destinationState")}</Label>
            <Controller
              name="destination_state"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("destination_municipality", "");
                    setValue("destination_city", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("destinationState")} />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosLoading ? (
                      <SelectItem value="" disabled>
                        {tc("loading")}
                      </SelectItem>
                    ) : (
                      estados.map((e) => (
                        <SelectItem key={e.name} value={e.name}>
                          {e.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("destinationMunicipality")}</Label>
            <Controller
              name="destination_municipality"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("destination_city", "");
                  }}
                  disabled={!destEstado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("destinationMunicipality")} />
                  </SelectTrigger>
                  <SelectContent>
                    {destEstado?.municipios.map((m) => (
                      <SelectItem key={m.municipio} value={m.municipio}>
                        {m.municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("destinationCity")}</Label>
            <Controller
              name="destination_city"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={!destEstado || !destMunicipality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("destinationCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {destEstado?.municipios
                      .find((m) => m.municipio === destMunicipality)
                      ?.ciudades.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

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
