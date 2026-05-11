import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "checkmybirth.day — what the world looked like the day you were born";

async function loadGoogleFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((r) => r.text());
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error(`font load failed: ${family}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const title = "checkmybirth.day";
  const subtitle = "What the world looked like the day you were born.";

  const [caveat, kalam] = await Promise.all([
    loadGoogleFont("Caveat", 700, title),
    loadGoogleFont("Kalam", 400, subtitle),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "80px 120px",
          background: "#fdfdfb",
          backgroundImage:
            "repeating-linear-gradient(transparent 0 47px, rgba(120, 90, 40, 0.18) 47px 48px), linear-gradient(to right, transparent 119px, rgba(200, 60, 60, 0.35) 119px 121px, transparent 121px)",
          color: "#1c1917",
          transform: "rotate(-1deg)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Caveat",
            fontSize: 220,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Kalam",
            fontSize: 56,
            marginTop: 24,
            color: "#57534e",
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Caveat", data: caveat, style: "normal", weight: 700 },
        { name: "Kalam", data: kalam, style: "normal", weight: 400 },
      ],
    }
  );
}
