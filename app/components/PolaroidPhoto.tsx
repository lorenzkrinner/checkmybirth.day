"use client";

import { useEffect, useState } from "react";
import type { PhotoResult } from "../api/photo/route";

export function PolaroidPhoto({
  query,
  caption,
  searchId,
  className,
  style,
}: {
  query: string;
  caption: string;
  searchId: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [photo, setPhoto] = useState<PhotoResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPhoto() {
      try {
        const params = new URLSearchParams({ q: query, sid: searchId });
        const res = await fetch(`/api/photo?${params.toString()}`, {
          cache: "no-store",
        });
        const p = await res.json();
        if (cancelled) return;
        console.log(`[polaroid] "${query}" →`, p.url ? "HIT" : "MISS", p);
        setPhoto(p);
      } catch (err) {
        if (cancelled) return;
        console.warn(`[polaroid] "${query}" unavailable:`, err);
        setPhoto({ url: null, title: query });
      }
    }

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [query, searchId]);

  if (!photo?.url) return null;

  return (
    <div
      style={style}
      className={`bg-white pt-3 pb-10 px-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] ${className ?? ""}`}
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={caption}
          className="w-full h-full object-cover sepia-[.3] saturate-150 contrast-110 hue-rotate-[-10deg]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="mt-3 text-center text-stone-700 font-serif text-lg leading-tight px-1 line-clamp-2">
        {caption}
      </div>
    </div>
  );
}
