"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 6000;

const steps = [
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

const SIZE = 640;
const CENTER = SIZE / 2;
const RADIUS = 230;
const NODE = 136;
const HUB = 260;

function pointFor(index: number) {
  const angle = (-90 + index * (360 / steps.length)) * (Math.PI / 180);
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

export function Timeline() {
  const [active, setActive] = useState(0);
  const activeStep = steps[active];

  // Restarting on every `active` change means a manual click resets the
  // 6s countdown, so autoplay always resumes from whichever step was picked.
  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div>
      {/* Wheel layout — desktop */}
      <div
        className="relative mx-auto hidden md:block"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg
          className="absolute inset-0"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {steps.map((step, i) => {
            const p = pointFor(i);
            const isActive = i === active;
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={p.x}
                y2={p.y}
                className={cn(isActive ? step.line : "stroke-gray-300")}
                strokeWidth={isActive ? 3 : 2}
              />
            );
          })}
        </svg>

        {/* Hub */}
        <div
          className="absolute flex flex-col items-center justify-center text-center rounded-full bg-card border-2 border-primary/20 shadow-sm p-9"
          style={{
            width: HUB,
            height: HUB,
            left: CENTER,
            top: CENTER,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className={cn(
              "text-sm font-bold uppercase tracking-wide mb-1.5",
              activeStep.text,
            )}
          >
            Paso {active + 1}
          </span>
          <h3 className="font-bold text-lg mb-1.5">{activeStep.title}</h3>
          <p className="text-sm text-muted-foreground leading-snug">
            {activeStep.desc}
          </p>
        </div>

        {/* Step nodes */}
        {steps.map((step, i) => {
          const p = pointFor(i);
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className={cn(
                "group absolute flex flex-col items-center justify-center rounded-full border-2 bg-card text-center transition-all cursor-pointer hover:scale-105",
                isActive
                  ? cn(step.ring, step.ringActive, step.bg)
                  : cn("border-gray-300", step.hoverBorder, step.hoverBg),
              )}
              style={{
                width: NODE,
                height: NODE,
                left: p.x,
                top: p.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span
                className={cn(
                  "text-2xl font-bold leading-none mb-1.5",
                  isActive ? step.text : cn("text-gray-400", step.hoverText),
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium px-4 leading-tight",
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-900",
                )}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Single card + numbered selector below — mobile */}
      <div className="md:hidden max-w-[60%] mx-auto">
        {/* Grid-stack: every card shares the same cell so the row height is
            fixed to the tallest card and swapping steps never jumps. */}
        <div className="grid mb-5">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                className={cn(
                  "col-start-1 row-start-1 bg-card border-2 rounded-xl p-5 shadow-sm transition-all duration-300 ease-out",
                  step.ring,
                  isActive
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2 pointer-events-none",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold uppercase tracking-wide",
                    step.text,
                  )}
                >
                  Paso {i + 1}
                </span>
                <h3 className="font-bold text-xl mt-1.5 mb-2">{step.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                aria-label={`Paso ${i + 1}: ${step.title}`}
                className={cn(
                  "relative h-12 w-12 shrink-0 rounded-full text-base font-bold cursor-pointer",
                  "shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm",
                  isActive
                    ? cn(
                        "text-white scale-110 ring-3 ring-offset-2 ring-offset-background",
                        step.solid,
                        step.dotRing,
                      )
                    : cn(
                        "bg-gray-300 text-gray-500 hover:text-white",
                        step.hoverSolid,
                      ),
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
