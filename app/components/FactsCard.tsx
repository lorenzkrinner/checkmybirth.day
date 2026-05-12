"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoonPhase } from "./MoonPhase";
import type { FactsResponse } from "../api/facts/route";

const MS_PER_DAY = 86_400_000;

function ageStats(birth: Date, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dob = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());

  let years = today.getFullYear() - dob.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hadBirthdayThisYear) years--;

  const daysLived = Math.floor((today.getTime() - dob.getTime()) / MS_PER_DAY);

  const nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday.getTime() < today.getTime()) nextBday.setFullYear(today.getFullYear() + 1);
  const daysToNext = Math.round((nextBday.getTime() - today.getTime()) / MS_PER_DAY);

  return { years, daysLived, daysToNext };
}

export function DatesCard({ birthDate }: { birthDate: Date }) {
  const { years, daysLived, daysToNext } = ageStats(birthDate);
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">A Few Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat value={years.toLocaleString()} label="years old" />
          <Stat value={daysLived.toLocaleString()} label="days lived" />
          <Stat
            value={daysToNext === 0 ? "today!" : daysToNext.toLocaleString()}
            label={daysToNext === 0 ? "🎂" : "days to next birthday"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function MoonCard({ birthDate }: { birthDate: Date }) {
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Moon That Night</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-2">
        <MoonPhase date={birthDate} size={120} />
      </CardContent>
    </Card>
  );
}

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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}
