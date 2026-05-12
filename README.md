# checkmybirth.day

Type your birthday. Get the events, songs, weather, and famous people of that exact day.

Built with Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui, and Vertex AI (`gemini-2.5-flash`) via the Vercel AI SDK.

## Stack

- **Snapshot + News** — Vertex AI `gemini-2.5-flash` with web search grounding
- **Music charts** — Vertex AI + iTunes Search API for artwork/previews
- **Weather** — [Open-Meteo Archive API](https://open-meteo.com/) (no key)
- **Photos** — [Openverse](https://openverse.org/) (no key)
- **Location search** — Open-Meteo Geocoding (no key)

## Setup

```bash
pnpm install
pnpm dev
```

### Required env vars

Create `.env.local`:

```
# Vertex AI
GOOGLE_VERTEX_PROJECT=your-gcp-project-id
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_CLIENT_EMAIL=your-service-account@your-gcp-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

In Vercel, set the same vars in Project Settings → Environment Variables. Keep `GOOGLE_PRIVATE_KEY` as one line with escaped `\n` line breaks.

### Optional

```
NEXT_PUBLIC_SITE_URL=https://checkmybirth.day   # falls back to VERCEL_PROJECT_PRODUCTION_URL
```

## Scripts

| Command       | What it does                  |
| ------------- | ----------------------------- |
| `pnpm dev`    | Start the Next.js dev server  |
| `pnpm build`  | Production build              |
| `pnpm start`  | Serve the production build    |
| `pnpm lint`   | ESLint                        |

## Dev-only helpers

In development (`NODE_ENV === "development"`), the home page pre-fills a date/location and exposes a snapshot toggle in the bottom-left that caches the last successful run in `localStorage`. None of this ships to production builds.

## Deploy

Push to the linked Vercel project. AI routes use `maxDuration = 60`.
