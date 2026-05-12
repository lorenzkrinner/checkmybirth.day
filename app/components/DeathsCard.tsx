"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FactsResponse } from "../api/facts/route";

export function DeathsCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts || facts.deaths.length === 0) return null;
  const death = facts.deaths[0];
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">People Who Died That Day</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 items-stretch md:min-h-96">
          <div className="flex-1 min-w-0 p-4 flex flex-col gap-2 md:order-1 order-2">
            <div className="inline-flex self-start px-2 py-1 rounded-md bg-black/80 text-white text-xs font-bold tracking-wide">
              DIED
            </div>
            <div className="font-bold text-stone-900 text-xl leading-tight">
              {death.url ? (
                <a href={death.url} target="_blank" rel="noreferrer" className="hover:underline">
                  {death.name}
                </a>
              ) : (
                death.name
              )}
            </div>
            {death.description && (
              <div className="text-stone-500 text-sm leading-snug">{death.description}</div>
            )}
          </div>
          <div className="relative w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 bg-stone-100 md:order-2 order-1">
            {death.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={death.thumbnail}
                alt={`${death.name} portrait`}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                No photo
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
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
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 rounded-none md:order-2 order-1" />
        </div>
      </CardContent>
    </Card>
  );
}
