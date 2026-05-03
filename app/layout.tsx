import type { Metadata } from "next";
import { Caveat, Kalam } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  title: "checkmybirth.day — what happened on the day you were born",
  description:
    "Type your birthday. Get the events, songs, and famous people of that exact day.",
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
      </body>
    </html>
  );
}
