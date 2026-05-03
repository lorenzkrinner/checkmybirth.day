import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { z } from "zod";

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": "https://checkmybirth.day",
    "X-Title": "checkmybirth.day",
  },
});

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const cache = new Map<string, string>();

export async function POST(req: Request) {
  const { date } = Body.parse(await req.json());

  if (cache.has(date)) {
    return new Response(cache.get(date)!, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "HIT" },
    });
  }

  const [year] = date.split("-").map(Number);
  const monthDay = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const result = streamText({
    model: openrouter("perplexity/sonar"),
    maxOutputTokens: 2000,
    prompt: `Search the web and write a fascinating, well-researched markdown report about ${monthDay}, ${year} — the exact day someone was born. Use ONLY information specific to that exact day or that exact year, not generic "this happened on this date in history" content.

## In the News That Day
3-5 actual headlines or major events from ${monthDay}, ${year} specifically. Each as: **Headline** — one sentence of context.

## Number One That Week
- **Billboard Hot 100 #1 (US):** song & artist
- **UK Singles Chart #1:** song & artist
- **#1 movie at the box office:** title

## Who Was in Charge
World leaders on ${monthDay}, ${year}:
- US President, UK Prime Minister, Pope, UN Secretary-General, plus any other major-country leader worth noting.

## The Year ${year}
A snapshot of ${year}: 4-6 bullets covering biggest cultural moments, tech that launched, what things cost (gas, average home, a movie ticket — pick whatever you can find), defining films, albums, fashion. Mix it up.

Use inline citation links from your search results. No preamble. Start directly with the first heading.`,
  });

  let full = "";
  const stream = result.toTextStreamResponse().body!;
  const [a, b] = stream.tee();

  (async () => {
    const reader = b.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value);
    }
    cache.set(date, full);
  })();

  return new Response(a, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "MISS" },
  });
}
