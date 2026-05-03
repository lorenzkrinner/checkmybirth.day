"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationSearch, type Location } from "./components/LocationSearch";
import { WeatherWidget } from "./components/WeatherWidget";
import { DatePicker } from "./components/DatePicker";
import { SongCard } from "./components/SongCard";

type Single = { song: string; artist: string } | null;
type ApiResponse = {
  summary: string;
  news: { headline: string; detail: string }[];
  charts: {
    billboardUS: Single;
    ukSingles: Single;
    boxOfficeMovie: string | null;
  };
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const isDev = process.env.NODE_ENV === "development";
const devDate = isDev ? new Date(2008, 7, 15) : undefined;
const devLocation: Location | null = isDev
  ? { label: "Bayern, Deutschland", lat: 48.7904, lon: 11.4979 }
  : null;

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(devDate);
  const [location, setLocation] = useState<Location | null>(devLocation);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);
  const [submittedLocation, setSubmittedLocation] = useState<Location | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;

    setSubmittedDate(date);
    setSubmittedLocation(location);
    setLoading(true);
    setData(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: toIso(date) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Couldn't fetch your birthday", { description: message });
    } finally {
      setLoading(false);
    }
  }

  const pretty = submittedDate
    ? submittedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const weekday = submittedDate ? WEEKDAYS[submittedDate.getDay()] : null;

  return (
    <main className="min-h-screen bg-[#faf7f2] text-stone-900 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-serif tracking-tight mb-3">
            checkmybirth.day
          </h1>
          <p className="text-stone-600 text-lg">
            What the world looked like the day you were born.
          </p>
        </header>

        <form onSubmit={onSubmit} className="mb-12 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DatePicker value={date} onChange={setDate} />
            <LocationSearch value={location} onChange={setLocation} />
          </div>
          <Button
            type="submit"
            disabled={loading || !date}
            size="lg"
            className="w-full h-12 text-base"
          >
            {loading ? "Searching…" : "Check"}
          </Button>
        </form>

        {submittedDate && (
          <div className="mb-8 pb-6 border-b border-stone-200">
            <div className="text-sm uppercase tracking-wider text-stone-500 mb-1">
              You were born on a {weekday}
            </div>
            <div className="text-3xl font-serif">{pretty}</div>
          </div>
        )}

        <div className="space-y-4">
          {loading && <SkeletonCards hasLocation={!!submittedLocation} />}

          {data && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="text-stone-700 leading-relaxed">
                  {data.summary}
                </CardContent>
              </Card>

              {submittedLocation && submittedDate && (
                <WeatherWidget
                  location={submittedLocation}
                  date={toIso(submittedDate)}
                />
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">In the News</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.news.length === 0 ? (
                    <p className="text-stone-500">no data</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.news.map((n, i) => (
                        <li key={i}>
                          <div className="font-medium text-stone-900">{n.headline}</div>
                          <div className="text-stone-600 text-sm leading-relaxed">{n.detail}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Number One That Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <SinglesCarousel
                    billboardUS={data.charts.billboardUS}
                    ukSingles={data.charts.ukSingles}
                  />
                  {data.charts.boxOfficeMovie && (
                    <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-baseline">
                      <span className="text-sm text-stone-500">Box office #1</span>
                      <span className="text-stone-900">{data.charts.boxOfficeMovie}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function SinglesCarousel({
  billboardUS,
  ukSingles,
}: {
  billboardUS: Single;
  ukSingles: Single;
}) {
  const items: { label: string; single: Single }[] = [
    { label: "Billboard Hot 100 (US)", single: billboardUS },
    { label: "UK Singles Chart", single: ukSingles },
  ];
  const filled = items.filter((i) => i.single);

  if (filled.length === 0) {
    return <p className="text-stone-500">no data</p>;
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-3">
        {filled.map(({ label, single }) => (
          <CarouselItem
            key={label}
            className="pl-3 basis-full sm:basis-1/2"
          >
            <SongCard song={single!.song} artist={single!.artist} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 disabled:hidden" />
      <CarouselNext className="right-2 disabled:hidden" />
    </Carousel>
  );
}

function SkeletonCards({ hasLocation }: { hasLocation: boolean }) {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
      {hasLocation && <Skeleton className="h-56 w-full rounded-3xl" />}
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    </>
  );
}
