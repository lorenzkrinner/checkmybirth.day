import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "checkmybirth.day — what happened on the day you were born";

export default async function Image() {
  const caveat = await fetch(
    "https://fonts.gstatic.com/s/caveat/v18/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIWpZTPN0w.ttf"
  ).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#faf3e3",
          backgroundImage:
            "repeating-linear-gradient(transparent 0 47px, rgba(120, 90, 40, 0.18) 47px 48px), linear-gradient(to right, transparent 119px, rgba(200, 60, 60, 0.35) 119px 121px, transparent 121px)",
          fontFamily: "Caveat",
          color: "#3b2a18",
        }}
      >
        <div style={{ fontSize: 56, opacity: 0.65, marginBottom: 8 }}>
          checkmybirth.day
        </div>
        <div style={{ fontSize: 132, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          what happened
          <br />
          on the day you
          <br />
          were born?
        </div>
        <div style={{ fontSize: 44, marginTop: 28, opacity: 0.75 }}>
          events · songs · weather · headlines
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Caveat", data: caveat, style: "normal", weight: 600 }],
    }
  );
}
