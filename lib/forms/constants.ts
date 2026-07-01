export const VEHICLE_TYPES = ["moto", "carro", "camioneta", "camion"] as const;

export const HOUSING_DESTRUCTION_OPTIONS = [
  "total",
  "grave",
  "se_puede_reparar",
  "prestada_emergencia",
] as const;

export const JOB_MODALITIES = ["presencial", "remoto", "hibrido"] as const;

export const AMENITY_TOGGLE_FIELDS = [
  { field: "has_furniture" as const, labelKey: "hasFurniture" },
  { field: "has_kitchen" as const, labelKey: "hasKitchen" },
  { field: "has_bathroom" as const, labelKey: "hasBathroom" },
] as const;

export const ACCEPT_TOGGLE_FIELDS = [
  { field: "accepts_children" as const, labelKey: "acceptsChildren" },
  { field: "accepts_adults" as const, labelKey: "acceptsAdults" },
  { field: "accepts_families" as const, labelKey: "acceptsFamilies" },
] as const;
