"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationSearch, type Location } from "./components/LocationSearch";
import { WeatherWidget, fetchWeather, type ArchiveResponse } from "./components/WeatherWidget";
import { DatePicker } from "./components/DatePicker";
import { PolaroidPhoto } from "./components/PolaroidPhoto";
import { Doodles } from "./components/Doodles";
import { DevSnapshotToggle } from "./components/DevSnapshotToggle";
import { SourcePebbles } from "./components/SourcePebbles";
import { InlineSourced, NewsCard, NewsSkeletonCard } from "./components/NewsCard";
import { DatesCard } from "./components/DatesCard";
import { MoonCard } from "./components/MoonCard";
import { TopMovieCard, TopMovieSkeletonCard } from "./components/TopMovieCard";
import { DeathsCard, DeathsSkeletonCard } from "./components/DeathsCard";
import { MusicCard, MusicSkeletonCard } from "./components/SinglesCarousel";
import type { PhotoHit, PhotoResponse } from "./api/photo/route";
import type { FactsResponse } from "./api/facts/route";

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
  factsData: FactsResponse | null;
  searchId: string;
};

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(devDate);
  const [location, setLocation] = useState<Location | null>(devLocation);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [musicData, setMusicData] = useState<MusicResponse | null>(null);
  const [weatherData, setWeatherData] = useState<ArchiveResponse | null>(null);
  const [factsData, setFactsData] = useState<FactsResponse | null>(null);
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
        setFactsData(snap.factsData);
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
    setFactsData(null);
    setLoading(true);

    const iso = toIso(date);
    const payload = { date: iso, location: location?.label ?? null };
    const json = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    const active = () => activeSearchRef.current === searchId;
    const snap: Snapshot = {
      date: iso,
      location,
      data: null,
      musicData: null,
      weatherData: null,
      factsData: null,
      searchId,
    };

    const checkP = fetch("/api/check", json)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `check ${r.status}`);
        return j as ApiResponse;
      })
      .then((v) => {
        if (!active()) return;
        setData(v);
        snap.data = v;
      })
      .catch((err) => active() && toast.error("Couldn't fetch your birthday", { description: err?.message }));

    const musicP = fetch("/api/music", json)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `music ${r.status}`);
        return j as MusicResponse;
      })
      .then((v) => {
        if (!active()) return;
        setMusicData(v);
        snap.musicData = v;
      })
      .catch((err) => active() && toast.error("Couldn't fetch the music", { description: err?.message }));

    const factsP = fetch("/api/facts", json)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `facts ${r.status}`);
        return j as FactsResponse;
      })
      .then((v) => {
        if (!active()) return;
        setFactsData(v);
        snap.factsData = v;
      })
      .catch(() => {});

    const weatherP = location
      ? fetchWeather(location, iso)
          .then((v) => {
            if (!active()) return;
            setWeatherData(v);
            snap.weatherData = v;
          })
          .catch((err) => active() && toast.error("Weather unavailable", { description: err?.message }))
      : Promise.resolve();

    Promise.allSettled([checkP, musicP, factsP, weatherP]).then(() => {
      if (!active()) return;
      setLoading(false);
      if (isDev) {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
        setHasSnapshot(true);
      }
    });
  }

  const weekday = submittedDate ? WEEKDAYS[submittedDate.getDay()] : null;
  const year = submittedDate?.getFullYear();
  const polaroidSearchId = currentSearchId && submittedDate ? currentSearchId : null;

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
    if (queries.length === 0) return;

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
      setPolaroidPool(shuffled.slice(0, 6));
    });

    return () => {
      cancelled = true;
    };
  }, [polaroidSearchId, submittedLocation, year, musicData, data]);

  const slotStyles = [
    { side: "-left-20 md:left-8",    tilt: "-rotate-6" },
    { side: "-right-20 md:right-12", tilt: "rotate-3"  },
    { side: "-left-20 md:left-16",   tilt: "rotate-2"  },
    { side: "-right-20 md:right-8",  tilt: "-rotate-3" },
    { side: "-left-20 md:left-12",   tilt: "rotate-5"  },
    { side: "-right-20 md:right-16", tilt: "-rotate-4" },
  ];

  const TOP_PCT = 8;
  const BOTTOM_PCT = 88;
  const n = polaroidPool.length;
  const slotTopPct = (i: number) =>
    n <= 1 ? TOP_PCT : TOP_PCT + (i / (n - 1)) * (BOTTOM_PCT - TOP_PCT);

  return (
    <main className="min-h-screen text-stone-900 px-6 pt-16 pb-40 relative overflow-hidden">
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
          const slot = slotStyles[i];
          return (
            <PolaroidPhoto
              key={`${polaroidSearchId}-${i}-${p.url}`}
              url={p.url}
              caption={p.title}
              source={p.source}
              className={`w-40 md:w-56 ${slot.side} ${slot.tilt}`}
              style={{ top: `${slotTopPct(i)}%` }}
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
          {submittedDate &&
            (data ? (
              <Card className="polaroid -rotate-1">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="text-stone-700 leading-relaxed text-lg">
                  <InlineSourced text={data.summary} />
                  <SourcePebbles urls={data.summarySources} />
                </CardContent>
              </Card>
            ) : (
              <SnapshotSkeletonCard />
            ))}

          {submittedDate && <DatesCard birthDate={submittedDate} />}
          {submittedDate &&
            (factsData ? <DeathsCard facts={factsData} /> : <DeathsSkeletonCard />)}
            {submittedLocation &&
              (weatherData ? (
                <div className="rotate-1">
                  <WeatherWidget location={submittedLocation} data={weatherData} />
                </div>
              ) : (
                <WeatherSkeletonCard />
              ))}
          {submittedDate && <MoonCard birthDate={submittedDate} />}
          {submittedDate &&
            (factsData ? <TopMovieCard facts={factsData} /> : <TopMovieSkeletonCard />)}

          {submittedDate && (data ? <NewsCard news={data.news} /> : <NewsSkeletonCard />)}

          {submittedDate &&
            (musicData ? (
              <MusicCard
                globalDaily={musicData.charts.globalDaily}
                regional={musicData.charts.regional}
                us={musicData.charts.us}
                regionalChartName={musicData.regionalChartName}
              />
            ) : (
              <MusicSkeletonCard />
            ))}

        </div>
      </div>
    </main>
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

