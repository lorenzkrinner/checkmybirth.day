import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

const MODEL = "gemini-2.5-flash";

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().nullable().optional(),
});

const Song = z.object({ song: z.string(), artist: z.string() });
type SongT = z.infer<typeof Song>;

const ResponseSchema = z.object({
  summary: z.string(),
  news: z.array(z.object({ headline: z.string(), detail: z.string() })),
  charts: z.object({
    globalDaily: Song.nullable(),
    regional: Song.nullable(),
    us: Song.nullable(),
    boxOfficeMovie: z.string().nullable(),
  }),
  regionalCountry: z.string().nullable(),
  regionalChartName: z.string().nullable(),
});

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/check] failed:", err);
    return Response.json({ error: message }, { status: 500 });
  }
}

async function handle(req: Request) {
  const { date, location } = Body.parse(await req.json());
  const [year] = date.split("-").map(Number);
  const monthDay = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const regionalAsk = location
    ? `the official national singles chart for "${location}" (e.g. Offizielle Deutsche Charts for Germany, Oricon for Japan, IFPI for Slovakia) for the week of that date`
    : "null (no location given)";

  const { text } = await generateText({
    model: google(MODEL),
    tools: { google_search: google.tools.googleSearch({}) },
    temperature: 0.4,
    prompt: `Research ${monthDay}, ${year} — the exact day someone was born — using web search. Then respond with ONLY a JSON object (no preamble, no markdown fences) matching this exact shape:

{
  "summary": "2-3 sentence vivid snapshot of what the world felt like that exact day",
  "news": [
    { "headline": "string", "detail": "one sentence of context" }
  ],
  "charts": {
    "globalDaily": { "song": "Exact Song Title", "artist": "Primary Artist Name" },
    "regional": { "song": "...", "artist": "..." },
    "us": { "song": "...", "artist": "..." },
    "boxOfficeMovie": "Exact Movie Title"
  },
  "regionalCountry": "ISO 3166-1 alpha-2 code (e.g. DE, US, JP)",
  "regionalChartName": "Name of the regional chart used"
}

Rules:
- "globalDaily": Spotify Global Top 50 #1 for that exact day, OR Billboard Global 200 weekly #1 if older.
- "us": Billboard Hot 100 #1 for the week of that date.
- "regional": #1 single from ${regionalAsk}.
- "regionalCountry" and "regionalChartName": ${location ? "set based on the regional chart you used" : "null"}.
- "boxOfficeMovie": #1 movie at the US box office that weekend.
- Song titles & artist names must match streaming services exactly — no "feat.", no album names, no quotes around them.
- Use literal JSON null (not the string "null") when no reliable data exists.
- "news": at least 4 entries, each a real event from THAT EXACT DAY (not "this week in history"). Use [] only if you genuinely cannot find any.
- Never invent facts — only use what your web search returned.`,
  });

  // Gemini sometimes wraps JSON in fences or includes preamble despite instructions
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON");
  const parsed = ResponseSchema.parse(JSON.parse(match[0]));

  const [globalDaily, us, regional] = await Promise.all([
    verifySong(parsed.charts.globalDaily),
    verifySong(parsed.charts.us),
    verifySong(parsed.charts.regional),
  ]);

  return Response.json({
    ...parsed,
    charts: { ...parsed.charts, globalDaily, us, regional },
  });
}

async function verifySong(s: SongT | null): Promise<SongT | null> {
  if (!s) return null;
  const term = `${s.song} ${s.artist}`;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: { results?: { previewUrl?: string }[] } = await res.json();
  return data.results?.[0]?.previewUrl ? s : null;
}
