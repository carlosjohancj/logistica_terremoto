"use client";

import { cn } from "@/lib/utils";
import type { TimelineStep } from "./timeline-steps";

type TimelineMobileProps = {
  steps: TimelineStep[];
  active: number;
  onSelect: (index: number) => void;
};

export function TimelineMobile({ steps, active, onSelect }: TimelineMobileProps) {
  return (
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
              onClick={() => onSelect(i)}
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
  );
}
