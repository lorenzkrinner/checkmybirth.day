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

type Death = FactsResponse["deaths"][number];

export function DeathsCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts || facts.deaths.length === 0) return null;
  const death = facts.deaths[0];
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Lost That Day</CardTitle>
      </CardHeader>
      <CardContent>
        <DeathCard death={death} />
      </CardContent>
    </Card>
  );
}

function DeathCard({ death }: { death: Death }) {
  return (
    <MediaCard>
      <MediaCardImage className="aspect-video max-h-96">
        {death.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={death.thumbnail}
            alt={`${death.name} portrait`}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No photo
          </div>
        )}
        <MediaCardBadge>DIED</MediaCardBadge>
      </MediaCardImage>

      <MediaCardBody>
        <MediaCardTitle>
          {death.url ? (
            <a href={death.url} target="_blank" rel="noreferrer" className="hover:underline">
              {death.name}
            </a>
          ) : (
            death.name
          )}
        </MediaCardTitle>
        {death.description && (
          <MediaCardSubtitle className="leading-snug">{death.description}</MediaCardSubtitle>
        )}
      </MediaCardBody>
    </MediaCard>
  );
}

export function DeathsSkeletonCard() {
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <Skeleton className="h-7 w-36" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}
