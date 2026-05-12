import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "checkmybirth.day — what the world looked like the day you were born";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#fdfdfb",
          backgroundImage:
            "linear-gradient(to right, rgba(220, 38, 38, 0.25) 0, rgba(220, 38, 38, 0.25) 3px, transparent 3px), repeating-linear-gradient(to bottom, transparent 0, transparent 47px, rgba(56, 132, 196, 0.35) 47px, rgba(56, 132, 196, 0.35) 49px)",
          backgroundPosition: "192px 0, 0 0px",
          backgroundRepeat: "repeat-y, repeat",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "auto",
            padding: "0px 32px"
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "sans-serif",
              fontWeight: 700,
              fontSize: 68,
              lineHeight: 1,
              letterSpacing: "-0.025em",
              marginBottom: 24,
              color: "#1c1917",
            }}
          >
            checkmybirth.day
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "sans-serif",
              fontSize: 40,
              color: "#57534e",
            }}
          >
            What the world looked like the day you were born.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
