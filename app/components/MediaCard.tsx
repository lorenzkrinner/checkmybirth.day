import * as React from "react";
import { cn } from "@/lib/utils";

function MediaCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card"
      className={cn(
        "bg-white rounded-2xl overflow-hidden flex flex-col h-full",
        className
      )}
      {...props}
    />
  );
}

function MediaCardImage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-image"
      className={cn("relative aspect-square w-full bg-stone-100", className)}
      {...props}
    />
  );
}

function MediaCardBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-badge"
      className={cn(
        "absolute top-3 left-3 px-2 py-1 rounded-md bg-black/55 backdrop-blur-sm text-white text-xs font-bold tracking-wide",
        className
      )}
      {...props}
    />
  );
}

function MediaCardBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-body"
      className={cn("p-4", className)}
      {...props}
    />
  );
}

function MediaCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-title"
      className={cn("font-bold text-stone-900 text-lg leading-tight", className)}
      {...props}
    />
  );
}

function MediaCardSubtitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="media-card-subtitle"
      className={cn("text-stone-500 text-sm mt-0.5", className)}
      {...props}
    />
  );
}

export {
  MediaCard,
  MediaCardImage,
  MediaCardBadge,
  MediaCardBody,
  MediaCardTitle,
  MediaCardSubtitle,
};
