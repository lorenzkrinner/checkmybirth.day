"use client";

import { Doodle } from "@/components/svgs";

export function Doodles() {
  return (
    <>
      <Doodle id="Rucksack"   x={-480} y={200}  size={100} rotate={-20} />
      <Doodle id="Whiteboard" x={430}  y={440}  size={180} rotate={20} />
      <Doodle id="ABC"        x={-160} y={410}  size={100} rotate={-3} />
      <Doodle id="Laptop"     x={-460}  y={620}  size={140} rotate={8} />
      <Doodle id="Basketball" x={320} y={140}  size={70} rotate={0} />
      <Doodle id="Books"      x={500}  y={700}  size={75} rotate={-12} />
      <Doodle id="Calculator" x={0} y={640}  size={80} rotate={4} />
      <Doodle id="Circle"     x={350}  y={900}  size={140} rotate={105} />
      <Doodle id="Ruler"      x={-460} y={880}  size={90} rotate={-40} />
      <Doodle id="Vials"      x={-100}  y={980}  size={100} rotate={-4} />
      <Doodle id="Headphones" x={-260} y={1100} size={52} rotate={6} />
      <Doodle id="Book"       x={420}  y={1220} size={44} rotate={-9} />
      <Doodle id="Globe"      x={-380} y={1340} size={56} rotate={3} />
      <Doodle id="Bubbles"    x={180}  y={1460} size={40} rotate={-6} />
      <Doodle id="Pen"        x={-180} y={1580} size={36} rotate={12} />
      <Doodle id="Airplane"   x={380}  y={1700} size={52} rotate={-3} />
      <Doodle id="SetSquare"  x={-420} y={1820} size={48} rotate={7} />
      <Doodle id="MusicNotes" x={240}  y={1940} size={56} rotate={-5} />
    </>
  );
}
