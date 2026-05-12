"use client";

import { useEffect, useState } from "react";
import { Doodle, type DoodleId } from "@/components/svgs";

const CELL_SIZE = 370;
const HORIZONTAL_OVERSCAN = 1.2;
const Y_START = 120;
const Y_END_PADDING = 200;

const CENTER_GUTTER = 0;
const FALLOFF_WIDTH = 280;
const CENTER_BASE_PROBABILITY = 0.45;

// rect (relative to viewport center horizontally, top of page vertically)
// that doodles must not overlap — keeps the page header clean
const HEADER_TOP = 0;
const HEADER_BOTTOM = 400;
const HEADER_HALF_WIDTH = 360;

// when picking an id for a cell, reject ids already used within this
// Chebyshev radius of cells — guarantees a minimum gap between same-id doodles
const SAME_ID_MIN_CELL_RADIUS = 2;

const DOODLES: { id: DoodleId; minSize: number; maxSize: number }[] = [
  { id: "Rucksack",   minSize: 80,  maxSize: 120 },
  { id: "Whiteboard", minSize: 140, maxSize: 200 },
  { id: "ABC",        minSize: 80,  maxSize: 120 },
  { id: "Laptop",     minSize: 110, maxSize: 160 },
  { id: "Basketball", minSize: 55,  maxSize: 90 },
  { id: "Books",      minSize: 60,  maxSize: 95 },
  { id: "Calculator", minSize: 65,  maxSize: 100 },
  { id: "Circle",     minSize: 100, maxSize: 160 },
  { id: "Ruler",      minSize: 70,  maxSize: 110 },
  { id: "Vials",      minSize: 80,  maxSize: 120 },
  { id: "Headphones", minSize: 70,  maxSize: 110 },
  { id: "Book",       minSize: 55,  maxSize: 90 },
  { id: "Globe",      minSize: 85,  maxSize: 130 },
  { id: "Bubbles",    minSize: 60,  maxSize: 95 },
  { id: "Pen",        minSize: 95,  maxSize: 140 },
  { id: "Airplane",   minSize: 75,  maxSize: 115 },
  { id: "SetSquare",  minSize: 65,  maxSize: 100 },
  { id: "MusicNotes", minSize: 80,  maxSize: 120 },
];

const MAX_ROTATE = 30;
const JITTER = 0.7; // 0 = perfect grid, 1 = anywhere in cell

// mulberry32 — deterministic PRNG seeded by integer
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// hash two ints into one — used so each (cellX, cellY) gets its own seed
function hash2(a: number, b: number) {
  let h = (a | 0) * 374761393 + (b | 0) * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

// 0 at center, 1 past FALLOFF_WIDTH from edge of gutter
function placementProbability(absX: number) {
  if (absX < CENTER_GUTTER) return 0;
  const t = Math.min(1, (absX - CENTER_GUTTER) / FALLOFF_WIDTH);
  const smooth = t * t * (3 - 2 * t);
  return CENTER_BASE_PROBABILITY + (1 - CENTER_BASE_PROBABILITY) * smooth;
}

type Placed = { key: string; id: DoodleId; x: number; y: number; size: number; rotate: number };

function overlapsHeader(x: number, y: number, size: number) {
  const half = size / 2;
  return (
    x + half > -HEADER_HALF_WIDTH &&
    x - half < HEADER_HALF_WIDTH &&
    y + half > HEADER_TOP &&
    y - half < HEADER_BOTTOM
  );
}

function generate(width: number, height: number): Placed[] {
  const halfW = (width * HORIZONTAL_OVERSCAN) / 2;
  const cellsX = Math.ceil(halfW / CELL_SIZE);
  const yStart = Math.floor(Y_START / CELL_SIZE);
  const yEnd = Math.ceil((height - Y_END_PADDING) / CELL_SIZE);

  const placedIdByCell = new Map<string, number>();
  const out: Placed[] = [];

  for (let cy = yStart; cy <= yEnd; cy++) {
    for (let cx = -cellsX; cx <= cellsX; cx++) {
      const rng = seeded(hash2(cx, cy));
      const cellCenterX = cx * CELL_SIZE + CELL_SIZE / 2;
      const cellCenterY = cy * CELL_SIZE + CELL_SIZE / 2;

      if (rng() > placementProbability(Math.abs(cellCenterX))) continue;

      const jx = (rng() - 0.5) * CELL_SIZE * JITTER;
      const jy = (rng() - 0.5) * CELL_SIZE * JITTER;
      const x = cellCenterX + jx;
      const y = cellCenterY + jy;

      // build a candidate order deterministically from the cell seed,
      // then pick the first id not used within SAME_ID_MIN_CELL_RADIUS
      const order: number[] = [];
      for (let i = 0; i < DOODLES.length; i++) order.push(i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }

      const forbidden = new Set<number>();
      for (let dy = -SAME_ID_MIN_CELL_RADIUS; dy <= SAME_ID_MIN_CELL_RADIUS; dy++) {
        for (let dx = -SAME_ID_MIN_CELL_RADIUS; dx <= SAME_ID_MIN_CELL_RADIUS; dx++) {
          if (dx === 0 && dy === 0) continue;
          const k = placedIdByCell.get(`${cx + dx}:${cy + dy}`);
          if (k !== undefined) forbidden.add(k);
        }
      }
      const idIndex = order.find((i) => !forbidden.has(i)) ?? order[0];
      const pick = DOODLES[idIndex];

      const size = pick.minSize + rng() * (pick.maxSize - pick.minSize);
      const rotate = (rng() - 0.5) * 2 * MAX_ROTATE;

      if (overlapsHeader(x, y, size)) continue;

      placedIdByCell.set(`${cx}:${cy}`, idIndex);
      out.push({ key: `${cx}:${cy}`, id: pick.id, x, y, size, rotate });
    }
  }
  return out;
}

export function Doodles() {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      setDims({
        w: window.innerWidth,
        h: document.documentElement.scrollHeight,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  if (!dims) return null;
  const placed = generate(dims.w, dims.h);
  return (
    <>
      {placed.map((p) => (
        <Doodle key={p.key} id={p.id} x={p.x} y={p.y} size={p.size} rotate={p.rotate} />
      ))}
    </>
  );
}
