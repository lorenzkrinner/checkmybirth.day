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
});

const Song = z.object({ song: z.string(), artist: z.string() });

const ResponseSchema = z.object({
  summary: z.string(),
  news: z.array(z.object({ headline: z.string(), detail: z.string() })),
  charts: z.object({
    billboardUS: Song.nullable(),
    ukSingles: Song.nullable(),
    boxOfficeMovie: z.string().nullable(),
  }),
});

type CheckResponse = z.infer<typeof ResponseSchema>;

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
  const { date } = Body.parse(await req.json());
  const [year] = date.split("-").map(Number);
  const monthDay = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const research = await researchDay(monthDay, year);
  const structured = await formatStructured(research, monthDay, year);
  const verified = await verifyCharts(structured);

  return Response.json(verified);
}

async function researchDay(monthDay: string, year: number): Promise<string> {
  const { text } = await generateText({
    model: openrouter(RESEARCH_MODEL),
    temperature: 0.5,
    maxOutputTokens: 2000,
    prompt: `Research everything specific to ${monthDay}, ${year} — the exact day. Cast a wide net: news headlines, world events, sports results, cultural moments, what was on TV, music charts, box office. Cite the chart sources you used (Billboard, OfficialCharts.com, etc.).

Cover at minimum:
- 4+ specific news events from THAT EXACT DAY (not generic "this week in history")
- Billboard Hot 100 #1 single in the US for the week of that date — give the exact song title and primary artist as on streaming services
- UK Official Singles Chart #1 for the week of that date — same format
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
): Promise<CheckResponse> {
  const prompt = `Below is a research dossier about ${monthDay}, ${year}. Extract the facts into the required schema.

Rules:
- "billboardUS" and "ukSingles": object with exact song title and primary artist as on streaming services (no "feat.", no album titles, no quotes). Use null (not an object with null fields) when the dossier has no reliable answer.
- "boxOfficeMovie": exact movie title or null.
- "news": at least 4 entries, each a real event from that exact day with one sentence of context. If the dossier truly has none, use [].
- "summary": 2-3 sentence vivid snapshot.
- Never invent facts not in the dossier.

DOSSIER:
${research}`;

  try {
    const { object } = await generateObject({
      model: openrouter(FORMATTER_PRIMARY),
      schema: ResponseSchema,
      temperature: 0.3,
      prompt,
    });
    return object;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[/api/check] primary formatter (${FORMATTER_PRIMARY}) failed, falling back to ${FORMATTER_FALLBACK}:`, message);
    const { object } = await generateObject({
      model: openrouter(FORMATTER_FALLBACK),
      schema: ResponseSchema,
      temperature: 0.3,
      prompt,
    });
    return object;
  }
}

async function verifyCharts(data: CheckResponse): Promise<CheckResponse> {
  const [billboardUS, ukSingles] = await Promise.all([
    verifySong(data.charts.billboardUS),
    verifySong(data.charts.ukSingles),
  ]);
  return {
    ...data,
    charts: { ...data.charts, billboardUS, ukSingles },
  };
}

async function verifySong(s: { song: string; artist: string } | null) {
  if (!s) return null;
  const term = `${s.song} ${s.artist}`;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=1`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) return s;
  const data: { results?: { previewUrl?: string }[] } = await res.json();
  const hit = data.results?.[0];
  return hit?.previewUrl ? s : null;
}
