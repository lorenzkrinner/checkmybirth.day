import { generateText } from "ai";
import { z } from "zod";
import { vertex } from "@/lib/vertex";

const MODEL = "gemini-2.5-flash";

export const maxDuration = 60;

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().nullable().optional(),
});

const Song = z.object({ song: z.string(), artist: z.string() });
type SongT = z.infer<typeof Song>;

const ResponseSchema = z.object({
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
    if (isNetworkError(err)) {
      console.warn("[/api/music] upstream unavailable:", message);
      return Response.json(
        { error: "The music lookup service is temporarily unavailable. Check your internet connection and try again." },
        { status: 503 }
      );
    }
    console.error("[/api/music] failed:", err);
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

  const regionalAsk = location
    ? `the official national singles chart for "${location}" (e.g. Offizielle Deutsche Charts for Germany, Oricon for Japan, IFPI for Slovakia) for the week of that date`
    : "null (no location given)";

  const { text } = await generateText({
    model: vertex(MODEL),
    tools: { google_search: vertex.tools.googleSearch({}) },
    temperature: 0.4,
    prompt: `Research the music and box office charts for ${monthDay}, ${year} using web search. Then respond with ONLY a JSON object (no preamble, no markdown fences) matching this exact shape:

{
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
- Song titles & artist names must match streaming services exactly. Avoid "feat.", album names, and quotes around titles.
- Use literal JSON null (not the string "null") when no reliable data exists.
- Never invent facts - only use what your web search returned.`,
  });

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
  let res: Response;

  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    console.warn("[/api/music] iTunes verification unavailable:", err);
    return null;
  }
  if (!res.ok) return null;
  const data: { results?: { previewUrl?: string }[] } = await res.json();
  return data.results?.[0]?.previewUrl ? s : null;
}
