export type TrackResult = {
  song: string;
  artist: string;
  artwork: string;
  previewUrl: string | null;
  appleMusicSearchUrl: string;
  spotifySearchUrl: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const song = searchParams.get("song")?.trim();
  const artist = searchParams.get("artist")?.trim();

  if (!song || !artist) {
    return Response.json({ error: "song and artist required" }, { status: 400 });
  }

  const term = `${song} ${artist}`;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=1`;

  const res = await fetch(url);
  const data = await res.json();
  const hit = data.results?.[0];

  const query = encodeURIComponent(term);
  const result: TrackResult = {
    song,
    artist,
    artwork: hit?.artworkUrl100?.replace("100x100", "600x600") ?? "",
    previewUrl: hit?.previewUrl ?? null,
    appleMusicSearchUrl: `https://music.apple.com/search?term=${query}`,
    spotifySearchUrl: `https://open.spotify.com/search/${query}`,
  };

  return Response.json(result);
}
