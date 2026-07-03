"use client"

type IndicatorsProps = {
  kmTotal: number
  viajesRealizados: number
  familiasAyudadas: number
  solicitudesPendientes: number
}

export default function Indicators({ kmTotal, viajesRealizados, familiasAyudadas, solicitudesPendientes }: IndicatorsProps) {
  const cards = [
    { label: "Kilómetros recorridos", value: `${kmTotal.toFixed(0)} km`, color: "bg-green-50 border-green-200" },
    { label: "Viajes realizados", value: String(viajesRealizados), color: "bg-blue-50 border-blue-200" },
    { label: "Familias ayudadas", value: String(familiasAyudadas), color: "bg-amber-50 border-amber-200" },
    { label: "Solicitudes pendientes", value: String(solicitudesPendientes), color: "bg-purple-50 border-purple-200" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
          <p className="text-sm text-muted-foreground">{c.label}</p>
          <p className="text-2xl font-bold mt-1">{c.value}</p>
        </div>
      ))}
    </div>
  )
}
