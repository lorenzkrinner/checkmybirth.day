"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "checkmybirthday:cache";

type Cache = Record<string, string>;

function loadCache(): Cache {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveCache(date: string, value: string) {
  const cache = loadCache();
  cache[date] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Home() {
  const [date, setDate] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{
    pretty: string;
    weekday: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;

    const d = new Date(date + "T00:00:00");
    setSubmitted({
      pretty: d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      weekday: WEEKDAYS[d.getDay()],
    });

    const cached = loadCache()[date];
    if (cached) {
      setResult(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setResult("");

    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      full += chunk;
      setResult((prev) => prev + chunk);
    }
    saveCache(date, full);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-stone-900 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-serif tracking-tight mb-3">
            checkmybirth.day
          </h1>
          <p className="text-stone-600 text-lg">
            What the world looked like the day you were born.
          </p>
        </header>

        <form onSubmit={onSubmit} className="flex gap-3 mb-12">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            required
          />
          <button
            type="submit"
            disabled={loading || !date}
            className="px-6 py-3 bg-stone-900 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-stone-800 transition"
          >
            {loading ? "Searching…" : "Check"}
          </button>
        </form>

        {submitted && (
          <div className="mb-8 pb-6 border-b border-stone-200">
            <div className="text-sm uppercase tracking-wider text-stone-500 mb-1">
              You were born on a {submitted.weekday}
            </div>
            <div className="text-3xl font-serif">{submitted.pretty}</div>
          </div>
        )}

        {loading && !result && (
          <div className="text-stone-500 italic">
            Searching the web for that day…
          </div>
        )}

        {result && (
          <article className="text-stone-800 leading-relaxed [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-stone-900 [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-stone-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:leading-relaxed [&_p]:mb-3">
            <ReactMarkdown>{result}</ReactMarkdown>
          </article>
        )}
      </div>
    </main>
  );
}
