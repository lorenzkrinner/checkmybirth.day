"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FactsResponse } from "../api/facts/route";

export function TopMovieCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts?.topMovie) return null;
  const m = facts.topMovie;
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Top Movie of {m.year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          {m.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.poster} alt={m.title} className="w-28 rounded shadow-md" />
          )}
          <a
            href={m.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-2xl text-stone-900 hover:underline leading-tight"
          >
            {m.title}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopMovieSkeletonCard() {
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <Skeleton className="h-7 w-44" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          <Skeleton className="w-28 h-40 rounded" />
          <Skeleton className="h-7 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}
