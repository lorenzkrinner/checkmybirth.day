export type PhotoResult = {
  url: string | null;
  title: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function uncachedJson(body: PhotoResult | { error: string }, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: { ...noStoreHeaders, ...init?.headers },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return uncachedJson({ error: "q required" }, { status: 400 });

  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=5&license_type=commercial&mature=false`;
  let res: Response;

  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    console.warn("[/api/photo] Openverse unavailable:", err);
    return uncachedJson({ url: null, title: q } satisfies PhotoResult);
  }

  if (!res.ok) {
    return uncachedJson({ url: null, title: q } satisfies PhotoResult);
  }

  const data = await res.json();
  const hit = data.results?.[0];
  return uncachedJson({
    url: hit?.url ?? null,
    title: hit?.title ?? q,
  } satisfies PhotoResult);
}
