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
      <div className="bg-white rounded-2xl overflow-hidden h-full flex flex-col">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square w-full bg-stone-100">
        {track.artwork ? (
          <Image
            src={track.artwork}
            alt={`${track.song} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No artwork
          </div>
        )}

        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/55 backdrop-blur-sm text-white text-xs font-bold tracking-wide">
          {label}
        </div>

        <div className="absolute top-3 right-3 flex gap-1.5">
          <a
            href={track.spotifySearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Spotify"
            className="w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white hover:bg-[#1DB954] flex items-center justify-center transition"
          >
            <SiSpotify className="w-4 h-4" />
          </a>
          <a
            href={track.appleMusicSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Apple Music"
            className="w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white hover:bg-stone-900 flex items-center justify-center transition"
          >
            <SiApplemusic className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-stone-900 text-lg leading-tight truncate">
            {track.song}
          </div>
          <div className="text-stone-500 mt-0.5 truncate">{track.artist}</div>
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
    </div>
  );
}
