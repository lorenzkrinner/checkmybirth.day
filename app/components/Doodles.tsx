"use client";

import { Doodle } from "@/components/svgs";

export function Doodles() {
  return (
    <>
      <Doodle id="Rucksack"   x={-540} y={200}  size={100} rotate={-20} />
      <Doodle id="Whiteboard" x={490}  y={440}  size={180} rotate={20} />
      <Doodle id="ABC"        x={150} y={650}  size={100} rotate={-3} />
      <Doodle id="Laptop"     x={-520} y={620}  size={140} rotate={8} />
      <Doodle id="Basketball" x={400}  y={140}  size={70}  rotate={0} />
      <Doodle id="Books"      x={560}  y={700}  size={75}  rotate={-12} />
      <Doodle id="Calculator" x={-200}  y={550}  size={80}  rotate={4} />
      <Doodle id="Circle"     x={420}  y={900}  size={140} rotate={105} />
      <Doodle id="Ruler"      x={-520} y={880}  size={90}  rotate={-40} />
      <Doodle id="Vials"      x={-180} y={980}  size={100} rotate={-4} />
      <Doodle id="Headphones" x={-500} y={1140} size={90}  rotate={-18} />
      <Doodle id="Book"       x={520}  y={1280} size={70}  rotate={14} />
      <Doodle id="Globe"      x={-220} y={1420} size={110} rotate={-6} />
      <Doodle id="Bubbles"    x={460}  y={1560} size={75}  rotate={8} />
      <Doodle id="Pen"        x={-520} y={1700} size={120} rotate={-30} />
      <Doodle id="Airplane"   x={280}  y={1880} size={95}  rotate={18} />
      <Doodle id="SetSquare"  x={-440} y={2040} size={80}  rotate={-10} />
      <Doodle id="MusicNotes" x={520}  y={2180} size={100} rotate={5} />
    </>
  );
}
