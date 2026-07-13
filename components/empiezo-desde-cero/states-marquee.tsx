"use client";

import { StateCard } from "@/components/empiezo-desde-cero/state-card";
import { useMarqueeScroll } from "@/hooks/use-marquee-scroll";
import { useScrollToMatch } from "@/hooks/use-scroll-to-match";
import type { Estado } from "@/lib/estados";

type HousingOffer = {
  id: string;
  city: string;
  state: string;
  capacity: number;
  accepts_children: boolean;
  accepts_adults: boolean;
  accepts_families: boolean;
  notes?: string;
};

type StatesMarqueeProps = {
  estados: Estado[];
  citiesByState: Record<string, string[]>;
  housingByCity: Record<string, HousingOffer[]>;
  search: string;
};

const CARD_WIDTH = 288; // w-72
const GAP = 16; // gap-4
const STEP = CARD_WIDTH + GAP;

export function StatesMarquee({
  estados,
  citiesByState,
  housingByCity,
  search,
}: StatesMarqueeProps) {
  const singleSetWidth = estados.length * STEP;

  const { containerRef, handleCardOpenChange } = useMarqueeScroll({
    singleSetWidth,
    isSearching: search.trim().length > 0,
  });
  useScrollToMatch(containerRef, estados, search, STEP);

  const loopItems = [...estados, ...estados];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Estados de Venezuela"
      className="flex gap-4 overflow-x-auto px-4 pb-1 cursor-grab select-none [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden touch-pan-x"
    >
      {loopItems.map((e, i) => {
        const key = `${e.id}-${i}`;
        return (
          <div key={key} className="w-72 shrink-0">
            <StateCard
              name={e.name}
              capital={e.capital}
              cities={citiesByState[e.name] || []}
              housingByCity={housingByCity}
              onOpenChange={(isOpen) => handleCardOpenChange(key, isOpen)}
            />
          </div>
        );
      })}
    </div>
  );
}
