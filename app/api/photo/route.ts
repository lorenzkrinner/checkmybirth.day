export type PhotoHit = {
  url: string;
  title: string;
  source: string;
};

export type PhotoResponse = {
  results: PhotoHit[];
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function uncachedJson(body: PhotoResponse | { error: string }, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: { ...noStoreHeaders, ...init?.headers },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const yearParam = searchParams.get("year")?.trim();
  if (!q) return uncachedJson({ error: "q required" }, { status: 400 });

  const year = yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : null;
  const finalQ = year && !q.includes(String(year)) ? `${q} ${year}` : q;

  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(finalQ)}&page_size=20&license_type=commercial&mature=false`;
  let res: Response;

  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    console.warn("[/api/photo] Openverse unavailable:", err);
    return uncachedJson({ results: [] });
  }

  if (!res.ok) return uncachedJson({ results: [] });

  const data = await res.json();
  type RawHit = {
    url?: string;
    title?: string;
    foreign_landing_url?: string;
    tags?: { name?: string }[];
  };

  const allowedYears = year ? new Set([year - 1, year, year + 1].map(String)) : null;
  const yearRegex = /\b(1[5-9]\d{2}|20\d{2})\b/g;

  const results: PhotoHit[] = (data.results ?? [])
    .filter((hit: RawHit) => {
      if (!hit?.url) return false;
      if (!allowedYears) return true;
      const haystack = [
        hit.title ?? "",
        hit.foreign_landing_url ?? "",
        ...(hit.tags?.map((t) => t.name ?? "") ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const found = haystack.match(yearRegex);
      if (!found) return false;
      return found.some((y) => allowedYears.has(y));
    })
    .slice(0, 8)
    .map((hit: RawHit) => ({
      url: hit.url!,
      title: hit.title ?? finalQ,
      source: hit.foreign_landing_url ?? hit.url!,
    }));

  return uncachedJson({ results });
}
