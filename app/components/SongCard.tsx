"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { SiSpotify, SiApplemusic } from "react-icons/si";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrackResult } from "../api/track/route";

export function SongCard({
  song,
  artist,
  label,
}: {
  song: string;
  artist: string;
  label: string;
}) {
  const [track, setTrack] = useState<TrackResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`/api/track?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`)
      .then((r) => r.json())
      .then(setTrack);
  }, [song, artist]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  }

  if (!track) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-3">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-3 flex flex-col gap-3 h-full">
      <div className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">
        {label}
      </div>
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-100">
        {track.artwork ? (
          <Image
            src={track.artwork}
            alt={`${track.song} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
            No artwork
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-stone-900 leading-tight truncate">
            {track.song}
          </div>
          <div className="text-sm text-stone-500 mt-0.5 truncate">
            {track.artist}
          </div>
        </div>
        {track.previewUrl && (
          <>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play preview"}
              className="shrink-0 w-10 h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center transition"
            >
              {playing ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
            <audio
              ref={audioRef}
              src={track.previewUrl}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
          </>
        )}
      </div>
      <div className="flex gap-2 pt-2 border-t border-stone-100">
        <a
          href={track.spotifySearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Spotify"
          className="text-stone-500 hover:text-[#1DB954] transition p-1"
        >
          <SiSpotify className="w-5 h-5" />
        </a>
        <a
          href={track.appleMusicSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Apple Music"
          className="text-stone-500 hover:text-stone-900 transition p-1"
        >
          <SiApplemusic className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
