"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import type { FactsResponse } from "../api/facts/route";

type Death = FactsResponse["deaths"][number];

export function DeathsCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts || facts.deaths.length === 0) return null;
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Lost That Day</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-3">
            {facts.deaths.map((d) => (
              <CarouselItem key={d.name} className="pl-3 basis-full sm:basis-1/2">
                <DeathCard death={d} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 disabled:hidden" />
          <CarouselNext className="right-2 disabled:hidden" />
        </Carousel>
      </CardContent>
    </Card>
  );
}

function DeathCard({ death }: { death: Death }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square w-full bg-stone-100">
        {death.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={death.thumbnail}
            alt={`${death.name} portrait`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No photo
          </div>
        )}
      </div>

      <div className="p-4">
        {death.url ? (
          <a
            href={death.url}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-stone-900 text-lg leading-tight hover:underline block"
          >
            {death.name}
          </a>
        ) : (
          <div className="font-bold text-stone-900 text-lg leading-tight">{death.name}</div>
        )}
        {death.description && (
          <div className="text-stone-500 mt-1 text-sm leading-snug">{death.description}</div>
        )}
      </div>
    </div>
  );
}

export function DeathsSkeletonCard() {
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <Skeleton className="h-7 w-36" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="basis-full sm:basis-1/2 flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="hidden sm:flex sm:basis-1/2 flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
