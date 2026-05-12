import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SourcePebbles } from "./SourcePebbles";
import { ThinkingBadge } from "./ThinkingBadge";

const VERTEX = /vertexaisearch\.cloud\.google\.com/;

export function InlineSourced({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    if (VERTEX.test(m[2])) {
      parts.push(m[1]);
    } else {
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
    }
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

type NewsItem = { headline: string; detail: string; sources: string[] };

export function NewsCard({ news }: { news: NewsItem[] }) {
  return (
    <Card className="polaroid -rotate-2">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">In the News</CardTitle>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <p className="text-stone-500">no data</p>
        ) : (
          <ul className="space-y-5">
            {news.map((n, i) => (
              <li key={i}>
                <div className="font-bold text-stone-900 text-lg leading-tight">{n.headline}</div>
                <div className="text-stone-600 leading-relaxed">
                  <InlineSourced text={n.detail} />
                </div>
                <SourcePebbles urls={n.sources} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function NewsSkeletonCard() {
  return (
    <Card className="polaroid -rotate-2">
      <CardHeader>
        <ThinkingBadge label="Thinking" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}
