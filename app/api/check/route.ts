import { generateText } from "ai";
import { z } from "zod";
import { vertex } from "@/lib/vertex";

const MODEL = "gemini-2.5-flash";

export const maxDuration = 60;

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().nullable().optional(),
});

const ResponseSchema = z.object({
  summary: z.string(),
  summarySources: z.array(z.string()),
  news: z.array(
    z.object({
      headline: z.string(),
      detail: z.string(),
      sources: z.array(z.string()),
    })
  ),
});

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (isNetworkError(err)) {
      console.warn("[/api/check] upstream unavailable:", message);
      return Response.json(
        { error: "The birthday lookup service is temporarily unavailable. Check your internet connection and try again." },
        { status: 503 }
      );
    }
    console.error("[/api/check] failed:", err);
    return Response.json({ error: message }, { status: 500 });
  }
}

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const text = `${err.message} ${err.stack ?? ""}`;
  return /ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|fetch failed|Cannot connect to API/i.test(text);
}

async function handle(req: Request) {
  const { date, location } = Body.parse(await req.json());
  const [year] = date.split("-").map(Number);
  const monthDay = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const { text } = await generateText({
    model: vertex(MODEL),
    tools: { google_search: vertex.tools.googleSearch({}) },
    temperature: 0.4,
    prompt: `Research ${monthDay}, ${year} — the exact day someone was born${location ? ` in or near ${location}` : ""} — using web search. Then respond with ONLY a JSON object (no preamble, no markdown fences) matching this exact shape:

{
  "summary": "2-3 sentence vivid snapshot of what the world felt like that exact day",
  "summarySources": ["https://...", "https://..."],
  "news": [
    { "headline": "string", "detail": "one sentence of context", "sources": ["https://...", "https://..."] }
  ]
}

Rules:
- If location is present, include a sentence in the summary about what that place was like where reliable.
- "news": at least 4 entries, each a real event from THAT EXACT DAY (not "this week in history"). Use [] only if you genuinely cannot find any.
- Write the "summary" and each news "detail" as plain prose, but anchor key facts to their sources using markdown links in the form [anchor text](https://source-url). Aim for 1–2 inline links per summary and per detail when sources support it.
- "summarySources" and each news "sources" array: list ALL source URLs you used for that field (including the ones you inlined). 1–4 real URLs from the web search. Use the URLs your search tool returned — do not fabricate them. Empty array only if you genuinely have no source.
- Never invent facts or URLs — only use what your web search returned.`,
  });

  // Gemini sometimes wraps JSON in fences or includes preamble despite instructions
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON");
  const parsed = ResponseSchema.parse(JSON.parse(match[0]));
  return Response.json(await resolveGroundingRedirects(parsed));
}

type Parsed = z.infer<typeof ResponseSchema>;

const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const VERTEX = /vertexaisearch\.cloud\.google\.com/;

async function resolveGroundingRedirects(parsed: Parsed): Promise<Parsed> {
  const urls = new Set<string>();
  parsed.summarySources.forEach((u) => urls.add(u));
  parsed.news.forEach((n) => n.sources.forEach((u) => urls.add(u)));
  for (const m of parsed.summary.matchAll(MD_LINK)) urls.add(m[2]);
  for (const n of parsed.news) for (const m of n.detail.matchAll(MD_LINK)) urls.add(m[2]);

  const entries = await Promise.all(
    [...urls].map((u) =>
      resolveOne(u)
        .then((r) => [u, r] as const)
        .catch(() => [u, null] as const)
    )
  );
  const map = new Map(entries);

  const stripDead = (s: string) =>
    s.replace(MD_LINK, (_, anchor, url) => {
      const resolved = map.get(url);
      return resolved ? `[${anchor}](${resolved})` : anchor;
    });
  const keepLive = (u: string) => map.get(u) ?? null;

  return {
    summary: stripDead(parsed.summary),
    summarySources: parsed.summarySources.map(keepLive).filter((u): u is string => !!u),
    news: parsed.news.map((n) => ({
      ...n,
      detail: stripDead(n.detail),
      sources: n.sources.map(keepLive).filter((u): u is string => !!u),
    })),
  };
}

async function resolveOne(url: string): Promise<string | null> {
  if (!VERTEX.test(url)) return url;
  const res = await fetch(url, { method: "HEAD", redirect: "follow" });
  // Redirect didn't fire (expired or bogus ID) — final URL still on the vertex host
  if (VERTEX.test(res.url)) return null;
  return res.url;
}
