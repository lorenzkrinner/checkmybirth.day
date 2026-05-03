export type PhotoResult = {
  url: string | null;
  title: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return Response.json({ error: "q required" }, { status: 400 });

  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=5&license_type=commercial&mature=false`;
  const res = await fetch(url, { cache: "force-cache" });

  if (!res.ok) {
    return Response.json({ url: null, title: q } satisfies PhotoResult);
  }

  const data = await res.json();
  const hit = data.results?.[0];
  return Response.json({
    url: hit?.url ?? null,
    title: hit?.title ?? q,
  } satisfies PhotoResult);
}
