"use client";

import { useMemo } from "react";

type DoodleProps = {
  className?: string;
  color?: string;
};

const STROKE = 3;

function Star({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M30 6 C32 18, 36 22, 52 24 C38 28, 36 32, 38 50 C30 38, 26 38, 10 44 C20 32, 20 28, 8 18 C24 20, 26 16, 30 6 Z" />
    </svg>
  );
}

function Heart({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M30 50 C 14 38, 6 28, 10 18 C 14 8, 26 10, 30 22 C 34 10, 46 8, 50 18 C 54 28, 46 38, 30 50 Z" />
    </svg>
  );
}

function Spiral({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" className={className}>
      <path d="M30 30 m-2 0 a2 2 0 1 1 6 2 a8 8 0 1 1 -14 -2 a14 14 0 1 1 22 6 a20 20 0 1 1 -28 -10" />
    </svg>
  );
}

function Lightning({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M34 6 L14 32 L26 32 L22 54 L46 24 L32 24 L36 6 Z" />
    </svg>
  );
}

function Squiggle({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 30" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" className={className}>
      <path d="M4 18 C 12 4, 20 28, 28 14 S 44 4, 52 18 S 68 28, 76 14" />
    </svg>
  );
}

function Sparkle({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" className={className}>
      <path d="M30 6 L30 26 M30 34 L30 54 M6 30 L26 30 M34 30 L54 30 M14 14 L22 22 M38 38 L46 46 M14 46 L22 38 M38 22 L46 14" />
    </svg>
  );
}

function Cloud({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 70 50" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 38 C 6 38, 4 26, 14 24 C 14 14, 28 12, 32 22 C 38 14, 54 16, 54 28 C 64 28, 66 40, 56 40 Z" />
    </svg>
  );
}

function Arrow({ className, color = "currentColor" }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 50" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 38 C 20 10, 50 8, 70 22" />
      <path d="M62 12 L 72 22 L 60 28" />
    </svg>
  );
}

const DOODLES = [Star, Heart, Spiral, Lightning, Squiggle, Sparkle, Cloud, Arrow];
// Notebook pen palette: blues, black, red, green
const COLORS = [
  "#1d4ed8", // blue
  "#2563eb", // brighter blue
  "#1e3a8a", // navy
  "#0891b2", // teal-blue
  "#171717", // black
  "#dc2626", // red
  "#16a34a", // green
];

type Placement = {
  Doodle: (p: DoodleProps) => React.JSX.Element;
  topPct: number;
  leftPct: number;
  size: number;
  rotate: number;
  color: string;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Jitter a uniform grid so doodles fully cover the area without clumping.
// Each cell gets one doodle anywhere inside it.
function generateScatter(cols: number, rows: number): Placement[] {
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const placements: Placement[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      placements.push({
        Doodle: pick(DOODLES),
        leftPct: cellW * col + cellW * Math.random(),
        topPct: cellH * row + cellH * Math.random(),
        size: 32 + Math.random() * 56,
        rotate: -30 + Math.random() * 60,
        color: pick(COLORS),
      });
    }
  }
  return placements;
}

export function Doodles({ height }: { height: number }) {
  // 3 cols × 4 rows = 12 doodles, fully tiled across width and height
  const scatter = useMemo(() => generateScatter(3, 4), []);
  if (height === 0) return null;

  return (
    <>
      {scatter.map((s, i) => {
        const top = (s.topPct / 100) * height;
        return (
          <div
            key={i}
            className="absolute pointer-events-none opacity-55 z-0"
            style={{
              top: `${top}px`,
              left: `${s.leftPct}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              transform: `rotate(${s.rotate}deg) translate(-50%, -50%)`,
              transformOrigin: "0 0",
            }}
          >
            <s.Doodle color={s.color} className="w-full h-full" />
          </div>
        );
      })}
    </>
  );
}
