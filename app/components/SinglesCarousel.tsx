"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SongCard } from "./SongCard";

type Song = { song: string; artist: string };

export function SinglesCarousel({
  globalDaily,
  regional,
  us,
  regionalChartName,
}: {
  globalDaily: Song | null;
  regional: Song | null;
  us: Song | null;
  regionalChartName: string | null;
}) {
  const items = [
    { label: "Global Top Today", song: globalDaily },
    { label: regionalChartName ?? "Regional", song: regional },
    { label: "Billboard Hot 100 (US)", song: us },
  ].filter((i): i is { label: string; song: Song } => !!i.song);

  if (items.length === 0) {
    return <p className="text-stone-500">no data</p>;
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-3">
        {items.map(({ label, song }) => (
          <CarouselItem key={`${label}-${song.song}-${song.artist}`} className="pl-3 basis-full sm:basis-1/2">
            <SongCard song={song.song} artist={song.artist} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 disabled:hidden" />
      <CarouselNext className="right-2 disabled:hidden" />
    </Carousel>
  );
}
