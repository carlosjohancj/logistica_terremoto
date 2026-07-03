"use client"

import { Gauge, Route, Users, ClipboardList } from "lucide-react"

type IndicatorsProps = {
  kmTotal: number
  viajesRealizados: number
  familiasAyudadas: number
  solicitudesPendientes: number
}

const cards = [
  {
    label: "Kilómetros recorridos",
    value: (km: number) => `${km.toFixed(0)} km`,
    icon: Route,
    gradient: "from-green-500 to-emerald-600",
    lightBg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    label: "Viajes realizados",
    value: (km: number) => String(km),
    icon: Gauge,
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Familias ayudadas",
    value: (km: number) => String(km),
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    label: "Solicitudes pendientes",
    value: (km: number) => String(km),
    icon: ClipboardList,
    gradient: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
  },
]

export default function Indicators({ kmTotal, viajesRealizados, familiasAyudadas, solicitudesPendientes }: IndicatorsProps) {
  const values = [kmTotal, viajesRealizados, familiasAyudadas, solicitudesPendientes]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        const val = c.value(values[i])
        return (
          <div
            key={c.label}
            className={`relative rounded-xl border overflow-hidden ${c.lightBg}`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${c.gradient} opacity-10`} />
            <div className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{c.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{val}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
