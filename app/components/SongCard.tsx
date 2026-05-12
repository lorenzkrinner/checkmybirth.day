"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MediaCard,
  MediaCardBadge,
  MediaCardBody,
  MediaCardImage,
  MediaCardSubtitle,
  MediaCardTitle,
} from "./MediaCard";
import type { TrackResult } from "../api/track/route";

export function SongCard({
  song,
  artist,
  label,
  onInvalid,
}: {
  song: string;
  artist: string;
  label: string;
  onInvalid?: () => void;
}) {
  const [track, setTrack] = useState<TrackResult | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`/api/track?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`, {
      cache: "no-store",
    })
      .then((r) => r.json() as Promise<TrackResult>)
      .then((t) => {
        if (!t.artwork && !t.appleMusicUrl) {
          setInvalid(true);
          onInvalid?.();
          return;
        }
        setTrack(t);
      })
      .catch(() => {
        setInvalid(true);
        onInvalid?.();
      });
  }, [song, artist, onInvalid]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  }

  if (invalid) return null;

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
    <MediaCard>
      <MediaCardImage className="max-h-96">
        {track.artwork ? (
          <Image
            src={track.artwork}
            alt={`${track.song} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No artwork
          </div>
        )}
        <MediaCardBadge>{label}</MediaCardBadge>
      </MediaCardImage>

      <MediaCardBody className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <MediaCardTitle className="truncate">
            {track.appleMusicUrl ? (
              <a
                href={track.appleMusicUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {track.song}
              </a>
            ) : (
              track.song
            )}
          </MediaCardTitle>
          <MediaCardSubtitle className="truncate">{track.artist}</MediaCardSubtitle>
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
      </MediaCardBody>
    </MediaCard>
  );
}
