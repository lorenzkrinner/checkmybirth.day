"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MediaCard,
  MediaCardBadge,
  MediaCardBody,
  MediaCardImage,
  MediaCardSubtitle,
  MediaCardTitle,
} from "./MediaCard";
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
        <MediaCard>
          <MediaCardImage className="aspect-video max-h-96">
            {m.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.poster}
                alt={`${m.title} poster`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                No poster
              </div>
            )}
            <MediaCardBadge>TOP GROSSER</MediaCardBadge>
          </MediaCardImage>

          <MediaCardBody>
            <MediaCardTitle>
              <a
                href={m.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {m.title}
              </a>
            </MediaCardTitle>
            <MediaCardSubtitle>{m.year}</MediaCardSubtitle>
          </MediaCardBody>
        </MediaCard>
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
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
