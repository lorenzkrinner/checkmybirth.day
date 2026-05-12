"use client";

import * as motion from "motion/react-client";
import { Skeleton } from "@/components/ui/skeleton";

const ROOT_CLASS =
  "absolute z-20 hidden md:block bg-white pt-3 pb-10 px-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)]";

type SwipeProps = {
  fromLeft: boolean;
  delay: number;
  tiltDeg: number;
};

function swipeAnim({ fromLeft, delay, tiltDeg }: SwipeProps) {
  return {
    initial: { x: fromLeft ? -600 : 600, opacity: 0, rotate: tiltDeg },
    animate: { x: 0, opacity: 1, rotate: tiltDeg },
    transition: { type: "spring" as const, stiffness: 90, damping: 14, delay },
  };
}

export function PolaroidSkeleton({
  className,
  style,
  fromLeft,
  delay,
  tiltDeg,
}: {
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
      {...swipeAnim({ fromLeft, delay, tiltDeg })}
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-200">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="mt-3 flex flex-col items-center gap-1.5 px-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </motion.div>
  );
}

export function PolaroidPhoto({
  url,
  caption,
  source,
  className,
  style,
  fromLeft,
  delay,
  tiltDeg,
}: {
  url: string;
  caption: string;
  source: string;
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
      {...swipeAnim({ fromLeft, delay, tiltDeg })}
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={caption}
          className="w-full h-full object-cover sepia-[.3] saturate-150 contrast-110 hue-rotate-[-10deg]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center text-stone-700 font-serif text-lg leading-tight px-1 line-clamp-2 hover:underline"
      >
        {caption}
      </a>
    </motion.div>
  );
}
