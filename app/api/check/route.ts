import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
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

const ResponseSchema = z.object({
  summary: z.string(),
  news: z.array(z.object({ headline: z.string(), detail: z.string() })),
  charts: z.object({
    billboardUS: z.string().nullable(),
    ukSingles: z.string().nullable(),
    boxOfficeMovie: z.string().nullable(),
  }),
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
  const { date } = Body.parse(await req.json());
  const [year] = date.split("-").map(Number);
  const monthDay = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const { text } = await generateText({
    model: openrouter("perplexity/sonar"),
    maxOutputTokens: 1500,
    prompt: `Search the web for facts about ${monthDay}, ${year} — the exact day someone was born. Only use info specific to that exact day, not generic "this happened on this date in history". Never repeat the same fact across fields. Use null or [] when no reliable data exists.

Respond with ONLY a valid JSON object matching this exact shape, no preamble, no markdown fences, no explanation:

{
  "summary": "2-3 sentence vivid snapshot of what the world felt like that exact day",
  "news": [
    { "headline": "string", "detail": "one sentence of context" }
  ],
  "charts": {
    "billboardUS": "Song Title — Artist or null",
    "ukSingles": "Song Title — Artist or null",
    "boxOfficeMovie": "Movie Title or null"
  }
}

news should have 3-5 entries (or empty array if no data). Use literal JSON null (not the string "null") for missing chart entries.`,
  });

  // Sonar sometimes wraps JSON in markdown fences despite instructions
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const object = ResponseSchema.parse(JSON.parse(cleaned));
  return Response.json(object);
}
