import type { Metadata } from "next";
import { Caveat, Kalam } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const handwriting = Kalam({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const heading = Caveat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const title = "checkmybirth.day — what happened on the day you were born";
const description =
  "Type your birthday. Get the events, songs, and famous people of that exact day.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { title, description, url: SITE_URL, siteName: "checkmybirth.day", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${handwriting.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
