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
import { travelRequestSchema, TravelRequestValues } from "@/lib/schemas/travel-request";

export function TravelRequestForm() {
  const t = useTranslations("travelRequest");
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
  const originState = watch("origin_state");
  const originMunicipality = watch("origin_municipality");
  const destState = watch("destination_state");
  const destMunicipality = watch("destination_municipality");

  const selectedOrigin = estados.find((e) => e.name === originState);
  const selectedDest = estados.find((e) => e.name === destState);

  async function onSubmit(values: TravelRequestValues) {
    try {
      const supabase = getSupabase();

      const data: Record<string, unknown> = {
        origin_state: values.origin_state,
        origin_municipality: values.origin_municipality,
        origin_city: values.origin_city,
        people_to_move: values.people_to_move,
        housing_destruction: values.housing_destruction,
        registrant_type: values.registrant_type,
        status: "open",
      };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) data.user = user.id;

      if (values.has_destination) {
        data.has_destination = true;
        data.destination_state = values.destination_state;
        data.destination_municipality = values.destination_municipality;
        data.destination_city = values.destination_city;
      }

      if (values.people_to_house) data.people_to_house = values.people_to_house;
      if (values.children_count) data.children_count = values.children_count;
      if (values.adults_count) data.adults_count = values.adults_count;
      if (values.registrant_relation) data.registrant_relation = values.registrant_relation;
      if (values.notes) data.notes = values.notes;

      if (user) {
        const { error } = await supabase
          .from("travel_requests")
          .insert(data)
          .select()
          .single();
        if (error) throw error;
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "travel_request", data }),
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
                  disabled={!selectedOrigin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("originMunicipality")} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedOrigin?.municipios.map((m) => (
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
                  disabled={!selectedOrigin || !originMunicipality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("originCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedOrigin?.municipios
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
                    disabled={!selectedDest}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("destinationMunicipality")} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDest?.municipios.map((m) => (
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
                    disabled={!selectedDest || !destMunicipality}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("destinationCity")} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDest?.municipios
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
                {["total", "grave", "se_puede_reparar", "prestada_emergencia"].map((opt) => (
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
