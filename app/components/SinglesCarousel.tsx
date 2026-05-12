"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SongCard } from "./SongCard";

type Song = { song: string; artist: string };

type Props = {
  globalDaily: Song | null;
  regional: Song | null;
  us: Song | null;
  regionalChartName: string | null;
};

export function MusicCard(props: Props) {
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Number One That Week</CardTitle>
      </CardHeader>
      <CardContent>
        <SinglesCarousel {...props} />
      </CardContent>
    </Card>
  );
}

export function MusicSkeletonCard() {
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function SinglesCarousel({ globalDaily, regional, us, regionalChartName }: Props) {
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
