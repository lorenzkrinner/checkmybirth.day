"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FactsResponse } from "../api/facts/route";

export function TopMovieCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts?.topMovie) return null;
  const m = facts.topMovie;
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Top Movie of {m.year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 items-stretch md:min-h-96">
          <div className="flex-1 min-w-0 p-4 flex flex-col gap-2 md:order-1 order-2">
            <div className="inline-flex self-start px-2 py-1 rounded-md bg-black/80 text-white text-xs font-bold tracking-wide">
              #1 BOX OFFICE
            </div>
            <div className="font-bold text-stone-900 text-xl leading-tight">
              <a
                href={m.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {m.title}
              </a>
            </div>
            <div className="text-stone-500 text-sm">{m.year}</div>
          </div>
          <div className="relative w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 bg-stone-100 md:order-2 order-1">
            {m.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.poster}
                alt={`${m.title} poster`}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                No poster
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopMovieSkeletonCard() {
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-44" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-row gap-4 items-stretch">
          <div className="flex-1 min-w-0 p-4 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="w-32 sm:w-40 md:w-48 shrink-0 rounded-none" />
        </div>
      </CardContent>
    </Card>
  );
}
