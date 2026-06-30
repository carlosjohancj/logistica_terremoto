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
import { housingOfferSchema, HousingOfferValues } from "@/lib/schemas/housing-offer";

type BooleanToggleField = keyof Pick<
  HousingOfferValues,
  | "accepts_children"
  | "accepts_adults"
  | "accepts_families"
  | "has_furniture"
  | "has_kitchen"
  | "has_bathroom"
>;

export function HousingOfferForm() {
  const t = useTranslations("housingOffer");
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

  const selectedStateName = watch("state");
  const municipality = watch("municipality");
  const selectedEstado = estados.find((e) => e.name === selectedStateName);

  const acceptToggles: Array<{ field: BooleanToggleField; label: string }> = [
    { field: "accepts_children", label: t("acceptsChildren") },
    { field: "accepts_adults", label: t("acceptsAdults") },
    { field: "accepts_families", label: t("acceptsFamilies") },
  ];

  const amenityToggles: Array<{ field: BooleanToggleField; label: string }> = [
    { field: "has_furniture", label: "Tiene muebles" },
    { field: "has_kitchen", label: "Tiene cocina" },
    { field: "has_bathroom", label: "Tiene baño" },
  ];

  async function onSubmit(values: HousingOfferValues) {
    try {
      const supabase = getSupabase();

      const data: Record<string, unknown> = {
        state: values.state,
        municipality: values.municipality,
        city: values.city,
        capacity: values.capacity,
        max_stay_days: values.max_stay_days,
        status: "open",
        accepts_children: values.accepts_children,
        accepts_adults: values.accepts_adults,
        accepts_families: values.accepts_families,
        has_furniture: values.has_furniture,
        has_kitchen: values.has_kitchen,
        has_bathroom: values.has_bathroom,
      };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) data.user = user.id;

      if (values.address) data.address = values.address;
      if (values.notes) data.notes = values.notes;

      if (user) {
        const { error } = await supabase
          .from("housing_offers")
          .insert(data)
          .select()
          .single();
        if (error) throw error;
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "housing_offer", data }),
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
      {/* Location */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("state")}</Label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("municipality", "");
                    setValue("city", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("state")} />
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
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("municipality")}</Label>
            <Controller
              name="municipality"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("city", "");
                  }}
                  disabled={!selectedEstado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("municipality")} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEstado?.municipios.map((m) => (
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
            <Label>{t("city")}</Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={!selectedEstado || !municipality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("city")} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEstado?.municipios
                      .find((m) => m.municipio === municipality)
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
        <div className="space-y-2">
          <Label>{t("address")}</Label>
          <Input {...register("address")} placeholder={t("address")} />
        </div>
      </div>

      {/* Capacity & stay */}
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

      {/* Accepts */}
      <div className="space-y-3">
        <Label>¿A quién aceptas?</Label>
        <div className="flex flex-wrap gap-2">
          {acceptToggles.map(({ field, label }) => (
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
                  {label}
                </Button>
              )}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Servicios del lugar</Label>
        <div className="flex flex-wrap gap-2">
          {amenityToggles.map(({ field, label }) => (
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
                  {label}
                </Button>
              )}
            />
          ))}
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
