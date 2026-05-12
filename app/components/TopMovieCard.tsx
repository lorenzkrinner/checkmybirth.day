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
          <div className="relative w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 bg-stone-100">
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
          <div className="flex-1 min-w-0 p-4 flex flex-col gap-3">
            <div>
              {m.director && (
                <span className="block text-stone-800 mb-1">{m.director}</span>
              )}
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
              {m.runtime && (
                <div className="text-stone-500 text-sm mt-0.5">{formatRuntime(m.runtime)}</div>
              )}
            </div>
            {m.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {m.genres.slice(0, 4).map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatRuntime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function TopMovieSkeletonCard() {
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-44" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:min-h-96">
          <Skeleton className="w-full aspect-[4/5] md:aspect-auto md:w-1/2 shrink-0 rounded-none" />
          <div className="flex-1 min-w-0 p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
