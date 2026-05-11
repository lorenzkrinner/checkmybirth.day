import { vertex } from "@ai-sdk/google-vertex";
import { generateText } from "ai";
import { z } from "zod";

const MODEL = "gemini-2.5-flash";

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().nullable().optional(),
});

const ResponseSchema = z.object({
  summary: z.string(),
  news: z.array(z.object({ headline: z.string(), detail: z.string() })),
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
  "news": [
    { "headline": "string", "detail": "one sentence of context" }
  ]
}

Rules:
- If location is present, include a sentence in the summary about what that place was like where reliable.
- "news": at least 4 entries, each a real event from THAT EXACT DAY (not "this week in history"). Use [] only if you genuinely cannot find any.
- Never invent facts — only use what your web search returned.`,
  });

  // Gemini sometimes wraps JSON in fences or includes preamble despite instructions
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON");
  return Response.json(ResponseSchema.parse(JSON.parse(match[0])));
}
