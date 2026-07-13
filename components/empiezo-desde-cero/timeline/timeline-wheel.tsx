"use client";

import { cn } from "@/lib/utils";
import type { TimelineStep } from "./timeline-steps";

const SIZE = 640;
const CENTER = SIZE / 2;
const RADIUS = 230;
const NODE = 136;
const HUB = 260;

function pointFor(index: number, total: number) {
  const angle = (-90 + index * (360 / total)) * (Math.PI / 180);
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

type TimelineWheelProps = {
  steps: TimelineStep[];
  active: number;
  onSelect: (index: number) => void;
};

export function TimelineWheel({ steps, active, onSelect }: TimelineWheelProps) {
  const activeStep = steps[active];

  return (
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
          const p = pointFor(i, steps.length);
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
        const p = pointFor(i, steps.length);
        const isActive = i === active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
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
  );
}
