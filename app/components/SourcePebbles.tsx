import type { ReactNode } from "react";

function hostOf(u: string): string {
  return u.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
}

export function InlineSourced({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(
      <a
        key={at}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-stone-900 underline decoration-stone-400 underline-offset-2 hover:decoration-stone-900"
      >
        {m[1]}
      </a>
    );
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function SourcePebbles({ urls }: { urls?: string[] }) {
  const sourceUrls = urls?.filter((u) => typeof u === "string" && u.length > 0) ?? [];
  if (sourceUrls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {sourceUrls.map((u) => {
        const host = hostOf(u);
        return (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            title={host}
            className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`}
              alt=""
              width={14}
              height={14}
              className="rounded-sm"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {host}
          </a>
        );
      })}
    </div>
  );
}
