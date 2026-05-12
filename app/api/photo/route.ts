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
  if (!q) return uncachedJson({ error: "q required" }, { status: 400 });

  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=8&license_type=commercial&mature=false`;
  let res: Response;

  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    console.warn("[/api/photo] Openverse unavailable:", err);
    return uncachedJson({ results: [] });
  }

  if (!res.ok) return uncachedJson({ results: [] });

  const data = await res.json();
  const results: PhotoHit[] = (data.results ?? [])
    .filter((hit: { url?: string }) => hit?.url)
    .map((hit: { url: string; title?: string; foreign_landing_url?: string }) => ({
      url: hit.url,
      title: hit.title ?? q,
      source: hit.foreign_landing_url ?? hit.url,
    }));

  return uncachedJson({ results });
}
