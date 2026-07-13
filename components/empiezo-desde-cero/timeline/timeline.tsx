"use client";

import { useAutoAdvance } from "@/hooks/use-auto-advance";
import { TIMELINE_STEPS } from "./timeline-steps";
import { TimelineWheel } from "./timeline-wheel";
import { TimelineMobile } from "./timeline-mobile";

const AUTO_ADVANCE_MS = 6000;

export function Timeline() {
  const [active, setActive] = useAutoAdvance(TIMELINE_STEPS.length, AUTO_ADVANCE_MS);

  return (
    <div>
      <TimelineWheel steps={TIMELINE_STEPS} active={active} onSelect={setActive} />
      <TimelineMobile steps={TIMELINE_STEPS} active={active} onSelect={setActive} />
    </div>
  );
}
