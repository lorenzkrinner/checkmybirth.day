"use client";

import { Moon } from "lunarphase-js";
import { Card, CardContent } from "@/components/ui/card";
import { svgs } from "@/components/svgs";

const PHASE_FILE: Record<string, string> = {
  "New": "new",
  "Waxing Crescent": "waxing-crescent",
  "First Quarter": "first-quarter",
  "Waxing Gibbous": "waxing-gibbous",
  "Full": "full",
  "Waning Gibbous": "waning-gibbous",
  "Last Quarter": "third-quarter",
  "Waning Crescent": "waning-crescent",
};

type Star = {
  variant: "Star";
  top: string;
  side: "left" | "right";
  offset: string;
  size: number;
  rotate: number;
  opacity: number;
};

const STARS: Star[] = [
  { variant: "Star", top: "8%",  side: "left",  offset: "6%",  size: 64, rotate: -10, opacity: 0.75 },
  { variant: "Star", top: "62%", side: "left",  offset: "4%",  size: 78, rotate: 8,   opacity: 0.6 },
  { variant: "Star", top: "12%", side: "right", offset: "8%",  size: 56, rotate: 18,  opacity: 0.65 },
  { variant: "Star", top: "72%", side: "right", offset: "12%", size: 60, rotate: -14, opacity: 0.55 },
  { variant: "Star", top: "38%", side: "right", offset: "3%",  size: 38, rotate: 32,  opacity: 0.4 },
  { variant: "Star", top: "44%", side: "left",  offset: "10%", size: 34, rotate: -28, opacity: 0.4 },
];

export function MoonCard({ birthDate }: { birthDate: Date }) {
  const phase = Moon.lunarPhase(birthDate);
  const file = PHASE_FILE[phase] ?? "new";
  const illumination = Math.round(
    (1 - Math.cos(2 * Math.PI * Moon.lunarAgePercent(birthDate))) * 50
  );

  return (
    <Card
      className="-rotate-1 relative overflow-hidden border-0 text-stone-100 bg-black"
    >
      <CardContent className="relative flex items-center justify-center py-14 min-h-72 px-0">
        {STARS.map((s, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute pointer-events-none text-amber-100"
            style={{
              top: s.top,
              [s.side]: s.offset,
              width: `${s.size}px`,
              height: `${s.size}px`,
              transform: `rotate(${s.rotate}deg)`,
              opacity: s.opacity,
            }}
          >
            {s.variant === "Star" ? svgs.Star() : null}
          </div>
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/moon/${file}.png`}
          alt={phase}
          className="relative z-10 w-44 h-44 object-contain"
        />
      </CardContent>

      <div className="absolute top-4 left-4 z-20 text-right">
        <div className="font-serif text-lg text-stone-100 leading-tight">Moon That Day</div>
      </div>
      <div className="absolute bottom-3 right-4 z-20 text-right">
        <div className="font-serif text-sm text-stone-200 leading-tight">{phase} Moon · {illumination}% lit</div>
      </div>
    </Card>
  );
}
