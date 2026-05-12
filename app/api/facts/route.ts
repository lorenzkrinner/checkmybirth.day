import { z } from "zod";

export const maxDuration = 15;

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type Death = {
  name: string;
  description: string | null;
  url: string | null;
  thumbnail: string | null;
};

type TopMovie = {
  title: string;
  year: number;
  poster: string | null;
  url: string | null;
} | null;

export type FactsResponse = {
  deaths: Death[];
  topMovie: TopMovie;
};

export async function POST(req: Request) {
  try {
    const { date } = Body.parse(await req.json());
    const [year, month, day] = date.split("-").map(Number);

    const [deaths, topMovie] = await Promise.all([
      fetchDeaths(year, month, day),
      fetchTopMovie(year),
    ]);

    return Response.json({ deaths, topMovie } satisfies FactsResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/facts] failed:", err);
    return Response.json({ error: message }, { status: 500 });
  }
}

type WikiDeath = {
  text: string;
  year: number;
  pages?: {
    titles?: { normalized?: string };
    normalizedtitle?: string;
    extract?: string;
    description?: string;
    content_urls?: { desktop?: { page?: string } };
    thumbnail?: { source?: string };
  }[];
};

async function fetchDeaths(year: number, month: number, day: number): Promise<Death[]> {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/deaths/${mm}/${dd}`;

  const res = await fetch(url, {
    headers: { "Api-User-Agent": "checkmybirth.day (lorenz@checkmybirth.day)" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { deaths?: WikiDeath[] };
  if (!data.deaths) return [];

  return data.deaths
    .filter((d) => d.year === year)
    .map((d): Death => {
      const page = d.pages?.[0];
      const name = page?.titles?.normalized ?? page?.normalizedtitle ?? d.text.split(",")[0];
      return {
        name,
        description: page?.description ?? page?.extract ?? d.text,
        url: page?.content_urls?.desktop?.page ?? null,
        thumbnail: page?.thumbnail?.source ?? null,
      };
    });
}

type TMDBMovie = {
  title: string;
  release_date: string;
  poster_path: string | null;
  id: number;
};

async function fetchTopMovie(year: number): Promise<TopMovie> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  const url = `https://api.themoviedb.org/3/discover/movie?primary_release_year=${year}&sort_by=revenue.desc&include_adult=false&page=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { results?: TMDBMovie[] };
  const top = data.results?.[0];
  if (!top) return null;

  return {
    title: top.title,
    year,
    poster: top.poster_path ? `https://image.tmdb.org/t/p/w342${top.poster_path}` : null,
    url: `https://www.themoviedb.org/movie/${top.id}`,
  };
}
