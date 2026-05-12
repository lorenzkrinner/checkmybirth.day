"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FactsResponse } from "../api/facts/route";

export function DeathsCard({ facts }: { facts: FactsResponse | null }) {
  if (!facts || facts.deaths.length === 0) return null;
  return (
    <Card className="polaroid rotate-2">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Lost That Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {facts.deaths.map((d) => (
            <li key={d.name} className="flex items-start gap-3">
              {d.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.thumbnail}
                  alt={d.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
              )}
              <div className="leading-tight">
                {d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-stone-900 hover:underline"
                  >
                    {d.name}
                  </a>
                ) : (
                  <span className="font-bold text-stone-900">{d.name}</span>
                )}
                {d.description && <div className="text-stone-600 text-sm">{d.description}</div>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
