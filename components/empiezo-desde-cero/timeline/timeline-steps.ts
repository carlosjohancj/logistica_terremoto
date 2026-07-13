export type TimelineStep = {
  title: string;
  desc: string;
  ring: string;
  ringActive: string;
  text: string;
  bg: string;
  line: string;
  solid: string;
  dotRing: string;
  hoverBorder: string;
  hoverBg: string;
  hoverText: string;
  hoverSolid: string;
};

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    title: "Registro",
    desc: "Regístrate o registra a un familiar damnificado. Recolectamos información básica y necesidades urgentes.",
    ring: "border-sky-400",
    ringActive: "border-sky-500 ring-4 ring-sky-200",
    text: "text-sky-600",
    bg: "bg-sky-50",
    line: "stroke-sky-300",
    solid: "bg-sky-500",
    dotRing: "ring-sky-400",
    hoverBorder: "hover:border-sky-400",
    hoverBg: "hover:bg-sky-50",
    hoverText: "group-hover:text-sky-600",
    hoverSolid: "hover:bg-sky-500",
  },
  {
    title: "Evaluación",
    desc: "Un voluntario de gestión evalúa tu caso, verifica la información y determina las prioridades.",
    ring: "border-amber-400",
    ringActive: "border-amber-500 ring-4 ring-amber-200",
    text: "text-amber-600",
    bg: "bg-amber-50",
    line: "stroke-amber-300",
    solid: "bg-amber-500",
    dotRing: "ring-amber-400",
    hoverBorder: "hover:border-amber-400",
    hoverBg: "hover:bg-amber-50",
    hoverText: "group-hover:text-amber-600",
    hoverSolid: "hover:bg-amber-500",
  },
  {
    title: "Asignación",
    desc: "Te conectamos con transportistas, hospedaje y recursos según tus necesidades específicas.",
    ring: "border-emerald-400",
    ringActive: "border-emerald-500 ring-4 ring-emerald-200",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    line: "stroke-emerald-300",
    solid: "bg-emerald-500",
    dotRing: "ring-emerald-400",
    hoverBorder: "hover:border-emerald-400",
    hoverBg: "hover:bg-emerald-50",
    hoverText: "group-hover:text-emerald-600",
    hoverSolid: "hover:bg-emerald-500",
  },
  {
    title: "Traslado",
    desc: "Coordinamos el viaje desde tu ubicación actual hasta el destino de reasentamiento.",
    ring: "border-orange-400",
    ringActive: "border-orange-500 ring-4 ring-orange-200",
    text: "text-orange-600",
    bg: "bg-orange-50",
    line: "stroke-orange-300",
    solid: "bg-orange-500",
    dotRing: "ring-orange-400",
    hoverBorder: "hover:border-orange-400",
    hoverBg: "hover:bg-orange-50",
    hoverText: "group-hover:text-orange-600",
    hoverSolid: "hover:bg-orange-500",
  },
  {
    title: "Estabilización",
    desc: "Acceso a alojamiento temporal, empleo, insumos básicos y atención según requerimiento.",
    ring: "border-violet-400",
    ringActive: "border-violet-500 ring-4 ring-violet-200",
    text: "text-violet-600",
    bg: "bg-violet-50",
    line: "stroke-violet-300",
    solid: "bg-violet-500",
    dotRing: "ring-violet-400",
    hoverBorder: "hover:border-violet-400",
    hoverBg: "hover:bg-violet-50",
    hoverText: "group-hover:text-violet-600",
    hoverSolid: "hover:bg-violet-500",
  },
  {
    title: "Reasentamiento",
    desc: "Integración en la comunidad de destino con acompañamiento continuo de voluntarios y organizaciones.",
    ring: "border-rose-400",
    ringActive: "border-rose-500 ring-4 ring-rose-200",
    text: "text-rose-600",
    bg: "bg-rose-50",
    line: "stroke-rose-300",
    solid: "bg-rose-500",
    dotRing: "ring-rose-400",
    hoverBorder: "hover:border-rose-400",
    hoverBg: "hover:bg-rose-50",
    hoverText: "group-hover:text-rose-600",
    hoverSolid: "hover:bg-rose-500",
  },
];
