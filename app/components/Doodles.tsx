"use client";

import { Doodle, svgs, type DoodleId } from "@/components/svgs";

const IDS = Object.keys(svgs) as DoodleId[];

// Tailwind needs literal class names at build time, so we sample from a static pool.
const SIZES = ["w-6 h-6", "w-8 h-8", "w-10 h-10", "w-12 h-12", "w-14 h-14", "w-16 h-16"];
const ROTATIONS = [
  "-rotate-12",
  "-rotate-6",
  "-rotate-3",
  "rotate-0",
  "rotate-3",
  "rotate-6",
  "rotate-12",
];

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placement = {
  id: DoodleId;
  cx: number;
  top: number;
  className: string;
};

const STEP = 220;
const X_HALF_RANGE = 1100;
const Y_RANGE = 6000;
const JITTER_X = STEP * 0.5;
const JITTER_Y = STEP * 0.35;

function generatePlacements(): Placement[] {
  const rand = mulberry32(1337);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const out: Placement[] = [];
  let i = 0;
  const rows = Math.ceil(Y_RANGE / STEP);
  const cols = Math.ceil((X_HALF_RANGE * 2) / STEP);
  for (let r = 0; r < rows; r++) {
    const rowShift = r % 2 === 0 ? 0 : STEP / 2;
    for (let c = 0; c < cols; c++) {
      out.push({
        id: IDS[i++ % IDS.length],
        cx: -X_HALF_RANGE + c * STEP + rowShift + (rand() - 0.5) * JITTER_X,
        top: 40 + r * STEP + (rand() - 0.5) * JITTER_Y,
        className: `${pick(SIZES)} ${pick(ROTATIONS)} text-foreground`,
      });
    }
  }
  return out;
}

const PLACEMENTS = generatePlacements();

export function Doodles() {
  return (
    <>
      {PLACEMENTS.map((p, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute pointer-events-none z-0"
          style={{ top: `${p.top}px`, left: `calc(50% + ${p.cx}px)`, transform: "translate(-50%, -50%)" }}
        >
          <Doodle id={p.id} className={p.className} />
        </div>
      ))}
    </>
  );
}
