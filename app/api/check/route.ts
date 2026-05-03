import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject, generateText } from "ai";
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

const RESEARCH_MODEL = "perplexity/sonar";
const FORMATTER_PRIMARY = "deepseek/deepseek-chat-v3.1:free";
const FORMATTER_FALLBACK = "openai/gpt-5-mini";

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().nullable().optional(),
});

const Song = z.object({ song: z.string(), artist: z.string() });
type SongT = z.infer<typeof Song>;

const FormattedSchema = z.object({
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

type Formatted = z.infer<typeof FormattedSchema>;

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

  const research = await researchDay(monthDay, year, location ?? null);
  const formatted = await formatStructured(research, monthDay, year, location ?? null);

  const [globalDaily, us, regional] = await Promise.all([
    verifySong(formatted.charts.globalDaily),
    verifySong(formatted.charts.us),
    verifySong(formatted.charts.regional),
  ]);

  return Response.json({
    summary: formatted.summary,
    news: formatted.news,
    charts: {
      globalDaily,
      regional,
      us,
      boxOfficeMovie: formatted.charts.boxOfficeMovie,
    },
    regionalCountry: formatted.regionalCountry,
    regionalChartName: formatted.regionalChartName,
  });
}

async function researchDay(
  monthDay: string,
  year: number,
  location: string | null,
): Promise<string> {
  const regionalAsk = location
    ? `\n- Identify the country for "${location}" and find its #1 single on the official national singles chart for the week of that date (e.g. Offizielle Deutsche Charts for Germany, IFPI for Slovakia, Oricon for Japan). Cite the chart source.`
    : "";

  const { text } = await generateText({
    model: openrouter(RESEARCH_MODEL),
    temperature: 0.5,
    maxOutputTokens: 2200,
    prompt: `Research everything specific to ${monthDay}, ${year} — the exact day. Cast a wide net: news headlines, world events, sports results, cultural moments, what was on TV, music charts, box office. Cite the chart sources you used.

Cover at minimum:
- 4+ specific news events from THAT EXACT DAY (not generic "this week in history")
- Spotify Global Top 50 #1 song for that exact day, OR Billboard Global 200 #1 for the week if daily isn't available — exact title and primary artist as on streaming services
- Billboard Hot 100 #1 single in the US for the week of that date — same format${regionalAsk}
- #1 movie at the US box office that weekend
- A vivid 2-3 sentence vibe of what the world felt like that day

Write a thorough research dossier. Don't worry about format yet — another step will structure it.`,
  });
  return text;
}

async function formatStructured(
  research: string,
  monthDay: string,
  year: number,
  location: string | null,
): Promise<Formatted> {
  const prompt = `Below is a research dossier about ${monthDay}, ${year}. Extract the facts into the required schema.

Rules:
- "globalDaily": Spotify Global Top 50 #1 (or Billboard Global 200 weekly #1 if older) — exact song title and primary artist on streaming services, no "feat.", no album titles, no quotes. Use null if the dossier has no reliable answer.
- "us": Billboard Hot 100 #1 for that week — same format. Use null if no reliable answer.
- "regional": ${location ? `national singles chart #1 for the country of "${location}" for that week — same format` : "null (no location given)"}.
- "regionalCountry": ${location ? `ISO 3166-1 alpha-2 code for the country of "${location}" (e.g. "DE", "SK", "US")` : "null"}.
- "regionalChartName": ${location ? `name of the chart used for "regional" (e.g. "Offizielle Deutsche Charts")` : "null"}.
- "boxOfficeMovie": exact movie title or null.
- "news": at least 4 entries, each a real event from that exact day with one sentence of context. If the dossier truly has none, use [].
- "summary": 2-3 sentence vivid snapshot.
- Never invent facts not in the dossier.

DOSSIER:
${research}`;

  try {
    const { object } = await generateObject({
      model: openrouter(FORMATTER_PRIMARY),
      schema: FormattedSchema,
      temperature: 0.3,
      prompt,
    });
    return object;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[/api/check] primary formatter (${FORMATTER_PRIMARY}) failed, falling back to ${FORMATTER_FALLBACK}:`, message);
    const { object } = await generateObject({
      model: openrouter(FORMATTER_FALLBACK),
      schema: FormattedSchema,
      temperature: 0.3,
      prompt,
    });
    return object;
  }
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
