import type { ReactNode } from "react";

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
