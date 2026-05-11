"use client";

import { useEffect, useRef, useState } from "react";
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
import { WeatherWidget, fetchWeather, type ArchiveResponse } from "./components/WeatherWidget";
import { DatePicker } from "./components/DatePicker";
import { SongCard } from "./components/SongCard";
import { PolaroidPhoto } from "./components/PolaroidPhoto";
import { Doodles } from "./components/Doodles";
import { DevSnapshotToggle } from "./components/DevSnapshotToggle";
import { InlineSourced, SourcePebbles } from "./components/SourcePebbles";
import type { PhotoHit, PhotoResponse } from "./api/photo/route";

type Song = { song: string; artist: string };
type ApiResponse = {
  summary: string;
  summarySources: string[];
  news: { headline: string; detail: string; sources: string[] }[];
};

type MusicResponse = {
  charts: {
    globalDaily: Song | null;
    regional: Song | null;
    us: Song | null;
    boxOfficeMovie: string | null;
  };
  regionalCountry: string | null;
  regionalChartName: string | null;
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

const SNAPSHOT_KEY = "dev:snapshot:run";
const SNAPSHOT_ENABLED_KEY = "dev:snapshot:enabled";

type Snapshot = {
  date: string;
  location: Location | null;
  data: ApiResponse | null;
  musicData: MusicResponse | null;
  weatherData: ArchiveResponse | null;
  searchId: string;
};

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(devDate);
  const [location, setLocation] = useState<Location | null>(devLocation);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [musicData, setMusicData] = useState<MusicResponse | null>(null);
  const [weatherData, setWeatherData] = useState<ArchiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);
  const [submittedLocation, setSubmittedLocation] = useState<Location | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const activeSearchRef = useRef<string | null>(null);
  const [snapshotEnabled, setSnapshotEnabled] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);

  useEffect(() => {
    if (!isDev) return;
    setSnapshotEnabled(localStorage.getItem(SNAPSHOT_ENABLED_KEY) === "1");
    setHasSnapshot(localStorage.getItem(SNAPSHOT_KEY) !== null);
  }, []);

  function handleSnapshotToggle(v: boolean) {
    setSnapshotEnabled(v);
    localStorage.setItem(SNAPSHOT_ENABLED_KEY, v ? "1" : "0");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;

    if (isDev && snapshotEnabled) {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      if (raw) {
        const snap = JSON.parse(raw) as Snapshot;
        const restoredDate = new Date(snap.date);
        setDate(restoredDate);
        setLocation(snap.location);
        setSubmittedDate(restoredDate);
        setSubmittedLocation(snap.location);
        setData(snap.data);
        setMusicData(snap.musicData);
        setWeatherData(snap.weatherData);
        setCurrentSearchId(snap.searchId);
        activeSearchRef.current = snap.searchId;
        setLoading(false);
        return;
      }
    }

    const searchId = crypto.randomUUID();
    activeSearchRef.current = searchId;
    setCurrentSearchId(searchId);
    setSubmittedDate(date);
    setSubmittedLocation(location);
    setData(null);
    setMusicData(null);
    setWeatherData(null);
    setLoading(true);

    const iso = toIso(date);
    const payload = { date: iso, location: location?.label ?? null };
    const json = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };

    const checkP = fetch("/api/check", json).then(async (r) => {
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `check ${r.status}`);
      return j as ApiResponse;
    });
    const musicP = fetch("/api/music", json).then(async (r) => {
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `music ${r.status}`);
      return j as MusicResponse;
    });
    const weatherP = location ? fetchWeather(location, iso) : Promise.resolve(null);

    const [checkR, musicR, weatherR] = await Promise.allSettled([checkP, musicP, weatherP]);
    if (activeSearchRef.current !== searchId) return;

    if (checkR.status === "fulfilled") setData(checkR.value);
    else toast.error("Couldn't fetch your birthday", { description: checkR.reason?.message });

    if (musicR.status === "fulfilled") setMusicData(musicR.value);
    else toast.error("Couldn't fetch the music", { description: musicR.reason?.message });

    if (weatherR.status === "fulfilled") setWeatherData(weatherR.value);
    else toast.error("Weather unavailable", { description: weatherR.reason?.message });

    setLoading(false);

    if (isDev) {
      const snap: Snapshot = {
        date: iso,
        location,
        data: checkR.status === "fulfilled" ? checkR.value : null,
        musicData: musicR.status === "fulfilled" ? musicR.value : null,
        weatherData: weatherR.status === "fulfilled" ? weatherR.value : null,
        searchId,
      };
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
      setHasSnapshot(true);
    }
  }

  const weekday = submittedDate ? WEEKDAYS[submittedDate.getDay()] : null;
  const year = submittedDate?.getFullYear();
  const polaroidSearchId = data && currentSearchId && !loading ? currentSearchId : null;

  const [polaroidPool, setPolaroidPool] = useState<PhotoHit[]>([]);

  useEffect(() => {
    if (!polaroidSearchId) return;
    const queries = [
      submittedLocation ? `${submittedLocation.label} ${year}` : null,
      musicData?.charts.us
        ? `${musicData.charts.us.song} ${musicData.charts.us.artist}`
        : null,
      year ? `world ${year}` : null,
      ...(data?.news.map((n) => n.headline) ?? []),
    ].filter((q): q is string => !!q);

    let cancelled = false;
    Promise.all(
      queries.map((q) =>
        fetch(`/api/photo?q=${encodeURIComponent(q)}&sid=${polaroidSearchId}`, {
          cache: "no-store",
        })
          .then((r) => r.json() as Promise<PhotoResponse>)
          .then((j) => j.results)
          .catch(() => [] as PhotoHit[])
      )
    ).then((all) => {
      if (cancelled) return;
      const seen = new Set<string>();
      const pool = all.flat().filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setPolaroidPool(shuffled.slice(0, 5));
    });

    return () => {
      cancelled = true;
    };
  }, [polaroidSearchId, submittedLocation, year, musicData, data]);

  const slots = [
    { side: "-left-20 md:left-8",   tilt: "-rotate-6", top: 180 },
    { side: "-right-20 md:right-12", tilt: "rotate-3",  top: 620 },
    { side: "-left-20 md:left-16",  tilt: "rotate-2",  top: 1060 },
    { side: "-right-20 md:right-8", tilt: "-rotate-3", top: 1500 },
    { side: "-left-20 md:left-12",  tilt: "rotate-5",  top: 1940 },
  ];

  return (
    <main className="min-h-screen text-stone-900 px-6 py-16 relative overflow-hidden">
      <div aria-hidden className="notebook-paper absolute inset-0 z-0 pointer-events-none" />
      <Doodles />
      {isDev && (
        <DevSnapshotToggle
          enabled={snapshotEnabled}
          onToggle={handleSnapshotToggle}
          hasSnapshot={hasSnapshot}
        />
      )}
      {polaroidSearchId &&
        polaroidPool.map((p, i) => {
          const slot = slots[i];
          return (
            <PolaroidPhoto
              key={`${polaroidSearchId}-${i}-${p.url}`}
              url={p.url}
              caption={p.title}
              className={`w-40 md:w-56 ${slot.side} ${slot.tilt}`}
              style={{ top: `${slot.top}px` }}
            />
          );
        })}

      <div className="max-w-2xl mx-auto relative z-10">
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
          <div className="text-5xl font-serif leading-tight mb-10">You were born on a {weekday}</div>
        )}

        <div className="space-y-8">
          {loading && (
            <>
              <SnapshotSkeletonCard />
              {submittedLocation && <WeatherSkeletonCard />}
              <NewsSkeletonCard />
              <MusicSkeletonCard />
            </>
          )}

          {!loading && data && (
            <Card className="polaroid -rotate-1">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="text-stone-700 leading-relaxed text-lg">
                <InlineSourced text={data.summary} />
                <SourcePebbles urls={data.summarySources} />
              </CardContent>
            </Card>
          )}

          {!loading && weatherData && submittedLocation && (
            <div className="rotate-1">
              <WeatherWidget location={submittedLocation} data={weatherData} />
            </div>
          )}

          {!loading && data && (
            <Card className="polaroid -rotate-2">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">In the News</CardTitle>
              </CardHeader>
              <CardContent>
                {data.news.length === 0 ? (
                  <p className="text-stone-500">no data</p>
                ) : (
                  <ul className="space-y-5">
                    {data.news.map((n, i) => (
                      <li key={i}>
                        <div className="font-bold text-stone-900 text-lg leading-tight">{n.headline}</div>
                        <div className="text-stone-600 leading-relaxed">
                          <InlineSourced text={n.detail} />
                        </div>
                        <SourcePebbles urls={n.sources} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {!loading && musicData && (
            <Card className="polaroid rotate-1">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">Number One That Week</CardTitle>
              </CardHeader>
              <CardContent>
                <SinglesCarousel
                  globalDaily={musicData.charts.globalDaily}
                  regional={musicData.charts.regional}
                  us={musicData.charts.us}
                  regionalChartName={musicData.regionalChartName}
                />
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </main>
  );
}

function SinglesCarousel({
  globalDaily,
  regional,
  us,
  regionalChartName,
}: {
  globalDaily: Song | null;
  regional: Song | null;
  us: Song | null;
  regionalChartName: string | null;
}) {
  const items = [
    { label: "Global Top Today", song: globalDaily },
    { label: regionalChartName ?? "Regional", song: regional },
    { label: "Billboard Hot 100 (US)", song: us },
  ].filter((i): i is { label: string; song: Song } => !!i.song);

  if (items.length === 0) {
    return <p className="text-stone-500">no data</p>;
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-3">
        {items.map(({ label, song }) => (
          <CarouselItem key={`${label}-${song.song}-${song.artist}`} className="pl-3 basis-full sm:basis-1/2">
            <SongCard song={song.song} artist={song.artist} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 disabled:hidden" />
      <CarouselNext className="right-2 disabled:hidden" />
    </Carousel>
  );
}

function SnapshotSkeletonCard() {
  return (
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
  );
}

function NewsSkeletonCard() {
  return (
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
  );
}

function WeatherSkeletonCard() {
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-28" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 w-24" />
          </div>
          <div className="space-y-3 text-right">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}

function MusicSkeletonCard() {
  return (
    <Card className="polaroid rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </CardContent>
    </Card>
  );
}
