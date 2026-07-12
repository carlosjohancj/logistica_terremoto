import { Bed, Utensils, Shirt, Pill, Droplets, Sparkles, Cpu, Boxes, Sofa, Package2, type LucideIcon } from "lucide-react"

export const SUPPLY_CATEGORY_ICONS: Record<string, LucideIcon> = {
  camas: Bed,
  comida: Utensils,
  ropa: Shirt,
  medicinas: Pill,
  agua: Droplets,
  higiene: Sparkles,
  electronico: Cpu,
  materiales: Boxes,
  muebles: Sofa,
  otros: Package2,
}

export const SUPPLY_CATEGORY_LABELS: Record<string, string> = {
  camas: "Camas",
  comida: "Comida",
  ropa: "Ropa",
  medicinas: "Medicinas",
  agua: "Agua",
  higiene: "Higiene",
  electronico: "Electrónicos",
  materiales: "Materiales",
  muebles: "Muebles",
  otros: "Otros",
}

export const SUPPLY_CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  usado_bueno: "Usado - Buen estado",
  usado_regular: "Usado - Regular",
  no_aplica: "No aplica",
}

export const HOUSING_DESTRUCTION_LABELS: Record<string, string> = {
  total: "Destrucción total",
  grave: "Daños graves",
  se_puede_reparar: "Se puede reparar",
  prestada_emergencia: "Prestada para emergencia",
}

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  moto: "Moto",
  carro: "Carro",
  camioneta: "Camioneta",
  camion: "Camión",
}
