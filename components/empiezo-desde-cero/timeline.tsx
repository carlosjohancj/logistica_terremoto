"use client"

import { Check } from "lucide-react"

const steps = [
  {
    title: "Registro",
    desc: "Regístrate o registra a un familiar damnificado. Recolectamos información básica y necesidades urgentes.",
  },
  {
    title: "Evaluación",
    desc: "Un voluntario de gestión evalúa tu caso, verifica la información y determina las prioridades.",
  },
  {
    title: "Asignación",
    desc: "Te conectamos con transportistas, hospedaje y recursos según tus necesidades específicas.",
  },
  {
    title: "Traslado",
    desc: "Coordinamos el viaje desde tu ubicación actual hasta el destino de reasentamiento.",
  },
  {
    title: "Estabilización",
    desc: "Acceso a alojamiento temporal, empleo, insumos básicos y atención según requerimiento.",
  },
  {
    title: "Reasentamiento",
    desc: "Integración en la comunidad de destino con acompañamiento continuo de voluntarios y organizaciones.",
  },
]

export function Timeline() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-primary/30 hidden md:block" />
      <div className="space-y-8">
        {steps.map((step, i) => (
          <div key={i} className="relative pl-0 md:pl-12">
            <div className="hidden md:flex absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background items-center justify-center -translate-x-1/2">
              <Check className="h-2 w-2 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex md:hidden h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-sm">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-0 md:ml-8">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
