"use client";

import * as motion from "motion/react-client";
import { Skeleton } from "@/components/ui/skeleton";

const ROOT_CLASS =
  "absolute z-20 hidden md:block bg-white pt-3 pb-10 px-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)]";

type Photo = { url: string; caption: string; source: string };

export function PolaroidSlot({
  photo,
  className,
  style,
  fromLeft,
  delay,
  tiltDeg,
}: {
  photo: Photo | null;
  className?: string;
  style?: React.CSSProperties;
  fromLeft: boolean;
  delay: number;
  tiltDeg: number;
}) {
  return (
    <motion.div
      style={style}
      className={`${ROOT_CLASS} ${className ?? ""}`}
      initial={{ x: fromLeft ? -600 : 600, opacity: 0, rotate: tiltDeg }}
      animate={{ x: 0, opacity: 1, rotate: tiltDeg }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay }}
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-200">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover sepia-[.3] saturate-150 contrast-110 hue-rotate-[-10deg]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Skeleton className="w-full h-full rounded-none" />
        )}
      </div>
      {photo ? (
        <a
          href={photo.source}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-stone-700 font-serif text-lg leading-tight px-1 line-clamp-2 hover:underline"
        >
          {photo.caption}
        </a>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-1.5 px-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
    </motion.div>
  );
}
