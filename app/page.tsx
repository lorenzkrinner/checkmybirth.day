"use client";

import { useCallback, useRef, useState } from "react";
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
import { PolaroidPhoto } from "./components/PolaroidPhoto";

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
  const observerRef = useRef<ResizeObserver | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const contentRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    const measure = () => {
      console.log("[polaroids] measure:", node.offsetHeight);
      setContentHeight(node.offsetHeight);
    };
    measure();
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(node);
  }, []);

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
      console.log("[/api/check] response:", json);
      console.log("[/api/check] news count:", json.news?.length);
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

  const year = submittedDate?.getFullYear();
  const newsQueries = data
    ? data.news.map((n) => ({ query: n.headline, caption: n.headline }))
    : [];
  const seedQueries: ({ query: string; caption: string } | null)[] = [
    submittedLocation
      ? { query: `${submittedLocation.label} ${year}`, caption: submittedLocation.label }
      : null,
    data?.charts.billboardUS
      ? {
          query: `${data.charts.billboardUS.song} ${data.charts.billboardUS.artist}`,
          caption: data.charts.billboardUS.song,
        }
      : null,
    year ? { query: `world ${year}`, caption: `${year}` } : null,
  ];
  const photoQueries = [...seedQueries.filter(Boolean), ...newsQueries].slice(0, 6) as {
    query: string;
    caption: string;
  }[];

  if (typeof window !== "undefined" && data) {
    console.log("[polaroids] queries:", photoQueries);
    console.log("[polaroids] contentHeight:", contentHeight);
    console.log("[polaroids] viewport width:", window.innerWidth, "(xl needs ≥1280)");
  }

  // 6 polaroids, one per 1/6 of content height, alternating sides with varied offsets
  // Tailwind requires full literal class names — listed explicitly so JIT picks them up
  const slots = [
    { side: "left-8", tilt: "-rotate-6" },
    { side: "right-16", tilt: "rotate-3" },
    { side: "left-16", tilt: "rotate-2" },
    { side: "right-8", tilt: "-rotate-3" },
    { side: "left-12", tilt: "rotate-6" },
    { side: "right-12", tilt: "-rotate-2" },
  ];

  return (
    <main className="notebook-paper min-h-screen text-stone-900 px-6 py-16 relative overflow-hidden">
      {contentHeight > 0 &&
        photoQueries.map((p, i) => {
          const top = contentHeight * ((i * 2 + 1) / 12);
          const slot = slots[i];
          return (
            <PolaroidPhoto
              key={i}
              query={p.query}
              caption={p.caption}
              className={`hidden xl:block absolute w-56 ${slot.side} ${slot.tilt}`}
              style={{ top: `${top}px` }}
            />
          );
        })}

      <div ref={contentRef} className="max-w-2xl mx-auto relative">
        <header className="mb-12 -rotate-1">
          <h1 className="text-7xl font-serif tracking-tight mb-2 leading-none">
            checkmybirth.day
          </h1>
          <p className="text-stone-600 text-xl">
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
          <div className="text-5xl font-serif leading-tight mb-10">  You were born on a {weekday}</div>
        )}

        <div className="space-y-8">
          {loading && <SkeletonCards hasLocation={!!submittedLocation} />}

          {data && (
            <>
              <Card className="polaroid -rotate-1">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="text-stone-700 leading-relaxed text-lg">
                  {data.summary}
                </CardContent>
              </Card>

              {submittedLocation && submittedDate && (
                <div className="rotate-1">
                  <WeatherWidget
                    location={submittedLocation}
                    date={toIso(submittedDate)}
                  />
                </div>
              )}

              <Card className="polaroid -rotate-2">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">In the News</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.news.length === 0 ? (
                    <p className="text-stone-500">no data</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.news.map((n, i) => (
                        <li key={i}>
                          <div className="font-bold text-stone-900 text-lg leading-tight">{n.headline}</div>
                          <div className="text-stone-600 leading-relaxed">{n.detail}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="polaroid rotate-1">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">Number One That Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <SinglesCarousel
                    billboardUS={data.charts.billboardUS}
                    ukSingles={data.charts.ukSingles}
                  />
                  {data.charts.boxOfficeMovie && (
                    <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-baseline">
                      <span className="text-stone-500">Box office #1</span>
                      <span className="text-stone-900 text-lg">{data.charts.boxOfficeMovie}</span>
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
      <Card className="polaroid -rotate-1">
        <CardHeader>
          <Skeleton className="h-7 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
      {hasLocation && (
        <div className="rotate-1">
          <Skeleton className="h-56 w-full rounded-3xl" />
        </div>
      )}
      <Card className="polaroid -rotate-2">
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <Card className="polaroid rotate-1">
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
