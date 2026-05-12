"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { FactsResponse } from "../api/facts/route";

type Death = FactsResponse["deaths"][number];

export function DeathsCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts || facts.deaths.length === 0) return null;
  const multi = facts.deaths.length > 1;

  if (!multi) {
    return (
      <Card className="polaroid rotate-1">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">People Who Died That Day</CardTitle>
        </CardHeader>
        <CardContent>
          <DeathHorizontal death={facts.deaths[0]} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">People Who Died That Day</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-3">
            {facts.deaths.map((d, i) => (
              <CarouselItem
                key={`${d.name}-${i}`}
                className="pl-3 basis-full sm:basis-1/2"
              >
                <DeathStacked death={d} />
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

function lifespanLine(death: Death) {
  const span = death.birthYear ? `${death.birthYear} – ${death.deathYear}` : null;
  if (span && death.age) return `${span} · age ${death.age}`;
  return span ?? (death.age ? `age ${death.age}` : null);
}

function DeathHorizontal({ death }: { death: Death }) {
  const meta = lifespanLine(death);
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 items-stretch md:min-h-96">
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2 md:order-1 order-2">
        <div className="font-bold text-stone-900 text-xl leading-tight">
          {death.url ? (
            <a href={death.url} target="_blank" rel="noreferrer" className="hover:underline">
              {death.name}
            </a>
          ) : (
            death.name
          )}
        </div>
        {meta && <div className="text-stone-500 text-sm">{meta}</div>}
        {death.description && (
          <div className="text-stone-700 text-sm leading-snug mt-1">{death.description}</div>
        )}
        <ReadMore extract={death.extract} description={death.description} />
      </div>
      <div className="relative w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 bg-stone-100 md:order-2 order-1">
        <Portrait death={death} />
      </div>
    </div>
  );
}

function DeathStacked({ death }: { death: Death }) {
  const meta = lifespanLine(death);
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square w-full bg-stone-100">
        <Portrait death={death} />
      </div>
      <div className="p-4 flex flex-col gap-1">
        <div className="font-bold text-stone-900 text-lg leading-tight truncate">
          {death.url ? (
            <a href={death.url} target="_blank" rel="noreferrer" className="hover:underline">
              {death.name}
            </a>
          ) : (
            death.name
          )}
        </div>
        {meta && <div className="text-stone-500 text-sm">{meta}</div>}
        {death.description && (
          <div className="text-stone-700 text-sm leading-snug mt-1 line-clamp-2">
            {death.description}
          </div>
        )}
        <ReadMore extract={death.extract} description={death.description} />
      </div>
    </div>
  );
}

function Portrait({ death }: { death: Death }) {
  if (!death.thumbnail) {
    return (
      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
        No photo
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={death.thumbnail}
      alt={`${death.name} portrait`}
      className="absolute inset-0 w-full h-full object-cover object-top"
    />
  );
}

function ReadMore({ extract, description }: { extract: string | null; description: string | null }) {
  const [open, setOpen] = useState(false);
  if (!extract || extract === description) return null;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-1">
      <CollapsibleContent className="text-stone-700 text-sm leading-snug pb-1">
        {extract}
      </CollapsibleContent>
      <CollapsibleTrigger className="text-stone-500 hover:text-stone-800 text-sm underline underline-offset-2">
        {open ? "Show less" : "Read more"}
      </CollapsibleTrigger>
    </Collapsible>
  );
}

export function DeathsSkeletonCard() {
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-36" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:min-h-96">
          <div className="flex-1 min-w-0 p-4 space-y-2 md:order-1 order-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 rounded-none md:order-2 order-1" />
        </div>
      </CardContent>
    </Card>
  );
}
