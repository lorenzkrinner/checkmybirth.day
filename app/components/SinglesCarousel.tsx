"use client";

import { useCallback, useMemo, useState } from "react";
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
type Item = { label: string; song: Song };

type Props = {
  globalDaily: Song | null;
  regional: Song | null;
  us: Song | null;
  regionalChartName: string | null;
};

function itemKey(i: Item) {
  return `${i.label}-${i.song.song}-${i.song.artist}`;
}

export function MusicCard(props: Props) {
  const initial = useMemo<Item[]>(
    () =>
      [
        { label: "Global Top Today", song: props.globalDaily },
        { label: props.regionalChartName ?? "Regional", song: props.regional },
        { label: "Billboard Hot 100 (US)", song: props.us },
      ].filter((i): i is Item => !!i.song),
    [props.globalDaily, props.regional, props.us, props.regionalChartName],
  );

  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const items = initial.filter((i) => !invalid.has(itemKey(i)));

  const markInvalid = useCallback((key: string) => {
    setInvalid((s) => {
      if (s.has(key)) return s;
      const next = new Set(s);
      next.add(key);
      return next;
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Number One That Week</CardTitle>
      </CardHeader>
      <CardContent>
        <SinglesCarousel items={items} onInvalid={markInvalid} />
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

export function SinglesCarousel({
  items,
  onInvalid,
}: {
  items: Item[];
  onInvalid: (key: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-3">
        {items.map((item) => {
          const key = itemKey(item);
          return (
            <CarouselItem
              key={key}
              className={`pl-3 basis-full ${items.length > 1 ? "sm:basis-1/2" : ""}`}
            >
              <SongCard
                song={item.song.song}
                artist={item.song.artist}
                label={item.label}
                onInvalid={() => onInvalid(key)}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-2 disabled:hidden" />
      <CarouselNext className="right-2 disabled:hidden" />
    </Carousel>
  );
}
