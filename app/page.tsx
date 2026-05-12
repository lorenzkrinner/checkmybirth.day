"use client";

import { useEffect, useRef, useState } from "react";
import * as motion from "motion/react-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationSearch, type Location } from "./components/LocationSearch";
import { WeatherWidget, fetchWeather, type ArchiveResponse } from "./components/WeatherWidget";
import { DatePicker } from "./components/DatePicker";
import { PolaroidSlot } from "./components/PolaroidPhoto";
import { Doodles } from "./components/Doodles";
import { DevSnapshotToggle } from "./components/DevSnapshotToggle";
import { SourcePebbles } from "./components/SourcePebbles";
import { InlineSourced } from "./components/InlineSourced";
import { DatesCard, DatesSkeletonCard } from "./components/DatesCard";
import { MoonCard, MoonSkeletonCard } from "./components/MoonCard";
import { TopMovieCard, TopMovieSkeletonCard } from "./components/TopMovieCard";
import { ThinkingBadge } from "./components/ThinkingBadge";
import { DeathsCard, DeathsSkeletonCard } from "./components/DeathsCard";
import { MusicCard, MusicSkeletonCard } from "./components/SinglesCarousel";
import type { PhotoHit, PhotoResponse } from "./api/photo/route";
import type { FactsResponse } from "./api/facts/route";

type Song = { song: string; artist: string };
type ApiResponse = {
  summary: string;
  summarySources: string[];
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
};

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(devDate);
  const [location, setLocation] = useState<Location | null>(devLocation);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [musicData, setMusicData] = useState<MusicResponse | null>(null);
  const [musicFailed, setMusicFailed] = useState(false);
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

    const cachedAi: ApiResponse | null =
      isDev && snapshotEnabled
        ? (() => {
            const raw = localStorage.getItem(SNAPSHOT_KEY);
            if (!raw) return null;
            const snap = JSON.parse(raw) as Snapshot;
            return snap.date === toIso(date) ? snap.data : null;
          })()
        : null;

    const searchId = crypto.randomUUID();
    activeSearchRef.current = searchId;
    polaroidFetchedRef.current = null;
    setPolaroidPool([]);
    setCurrentSearchId(searchId);
    setSubmittedDate(date);
    setSubmittedLocation(location);
    setData(null);
    setMusicData(null);
    setMusicFailed(false);
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
      data: cachedAi,
    };

    if (cachedAi) {
      setData(cachedAi);
    }

    const checkP = cachedAi
      ? Promise.resolve()
      : fetch("/api/check", json)
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
      })
      .catch(() => active() && setMusicFailed(true));

    const factsP = fetch("/api/facts", json)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `facts ${r.status}`);
        return j as FactsResponse;
      })
      .then((v) => {
        if (!active()) return;
        setFactsData(v);
      })
      .catch(() => {});

    const weatherP = location
      ? fetchWeather(location, iso)
          .then((v) => {
            if (!active()) return;
            setWeatherData(v);
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
  const polaroidFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!polaroidSearchId || !data) return;
    if (polaroidFetchedRef.current === polaroidSearchId) return;
    const queries = [
      submittedLocation ? `${submittedLocation.label} ${year}` : null,
      musicData?.charts.us
        ? `${musicData.charts.us.song} ${musicData.charts.us.artist}`
        : null,
      year ? `world ${year}` : null,
    ].filter((q): q is string => !!q);
    if (queries.length === 0) return;
    polaroidFetchedRef.current = polaroidSearchId;

    let cancelled = false;
    Promise.all(
      queries.map((q) =>
        fetch(`/api/photo?q=${encodeURIComponent(q)}${year ? `&year=${year}` : ""}&sid=${polaroidSearchId}`, {
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
    { side: "xl:-left-[27rem]",  tiltDeg: -6, fromLeft: true  },
    { side: "xl:-right-[27rem]", tiltDeg:  3, fromLeft: false },
    { side: "xl:-left-96",       tiltDeg:  2, fromLeft: true  },
    { side: "xl:-right-96",      tiltDeg: -3, fromLeft: false },
    { side: "xl:-left-[27rem]",  tiltDeg:  5, fromLeft: true  },
    { side: "xl:-right-[27rem]", tiltDeg: -4, fromLeft: false },
  ];

  const slotTopPx = (i: number) => 180 + i * 360;

  return (
    <main className="min-h-screen text-stone-900 px-6 pt-16 pb-24 relative overflow-hidden">
      <div aria-hidden className="notebook-paper absolute inset-0 z-0 pointer-events-none" />
      <Doodles />
      {isDev && (
        <DevSnapshotToggle
          enabled={snapshotEnabled}
          onToggle={handleSnapshotToggle}
          hasSnapshot={hasSnapshot}
        />
      )}
      <div className="max-w-2xl mx-auto relative z-10">
        {polaroidSearchId &&
          slotStyles.map((slot, i) => {
            const hit = polaroidPool[i];
            return (
              <PolaroidSlot
                key={`${polaroidSearchId}-${i}`}
                photo={hit ? { url: hit.url, caption: hit.title, source: hit.source } : null}
                fromLeft={slot.fromLeft}
                tiltDeg={slot.tiltDeg}
                delay={i * 0.08}
                className={`hidden! xl:block! w-40 md:w-56 ${slot.side}`}
                style={{ top: `${slotTopPx(i)}px` }}
              />
            );
          })}

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
          <SpringIn>
            <div className="text-5xl font-serif leading-tight mb-10">You were born on a {weekday}</div>
          </SpringIn>
        )}

        <div className="space-y-8 h-full">
          {submittedDate && (
            <SpringIn>
              {data ? (
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
              )}
            </SpringIn>
          )}

          {submittedDate && (
            <SpringIn>
              {data ? <DatesCard birthDate={submittedDate} /> : <DatesSkeletonCard />}
            </SpringIn>
          )}
          {submittedLocation && submittedDate && (
            <SpringIn>
              {data && weatherData ? (
                <div className="rotate-1">
                  <WeatherWidget location={submittedLocation} data={weatherData} date={submittedDate} />
                </div>
              ) : (
                <WeatherSkeletonCard />
              )}
            </SpringIn>
          )}
          {submittedDate && (
            <SpringIn>
              {data ? <MoonCard birthDate={submittedDate} /> : <MoonSkeletonCard />}
            </SpringIn>
          )}
          {submittedDate && (
            <SpringIn>
              {data && factsData ? <DeathsCard facts={factsData} /> : <DeathsSkeletonCard />}
            </SpringIn>
          )}
          {submittedDate && (
            <SpringIn>
              {data && factsData ? <TopMovieCard facts={factsData} /> : <TopMovieSkeletonCard />}
            </SpringIn>
          )}

          {submittedDate && !musicFailed && (
            <SpringIn>
              {data && musicData ? (
                <MusicCard
                  globalDaily={musicData.charts.globalDaily}
                  regional={musicData.charts.regional}
                  us={musicData.charts.us}
                  regionalChartName={musicData.regionalChartName}
                />
              ) : (
                <MusicSkeletonCard />
              )}
            </SpringIn>
          )}

        </div>

        <footer className="mt-16 text-center text-sm text-stone-600 space-x-5">
          <span>
            Made by <a className="underline hover:text-stone-900" href="https://x.com/lorenzkrinner"  target="_blank" rel="noopener noreferrer">Lorenz</a>
          </span>
          <a href="https://github.com/lorenzkrinner/checkmybirth.day" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-900">
            Github
          </a>
        </footer>
      </div>
    </main>
  );
}

function SpringIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

function SnapshotSkeletonCard() {
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <ThinkingBadge label="Searching" />
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
