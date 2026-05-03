"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export type Location = {
  label: string;
  lat: number;
  lon: number;
};

type Feature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    type?: string;
    osm_value?: string;
    street?: string;
    housenumber?: string;
  };
};

function formatLabel(p: Feature["properties"]): string {
  const parts: string[] = [];
  if (p.street) parts.push(p.housenumber ? `${p.street} ${p.housenumber}` : p.street);
  else if (p.name) parts.push(p.name);
  if (p.city && p.city !== p.name) parts.push(p.city);
  if (p.state && p.state !== p.name && p.state !== p.city) parts.push(p.state);
  if (p.country) parts.push(p.country);
  return parts.join(", ");
}

export function LocationSearch({
  value,
  onChange,
}: {
  value: Location | null;
  onChange: (loc: Location | null) => void;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<Feature[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query || query === value?.label) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setResults(data.features ?? []);
      setOpen(true);
    }, 250);
  }, [query, value?.label]);

  function pick(f: Feature) {
    const label = formatLabel(f.properties);
    const [lon, lat] = f.geometry.coordinates;
    onChange({ label, lat, lon });
    setQuery(label);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value) onChange(null);
        }}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="City, region, street, country…"
        className="h-12 text-base! bg-white placeholder:text-base"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
          {results.map((f, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => pick(f)}
                className="w-full text-left px-4 py-2 hover:bg-stone-100 transition"
              >
                {formatLabel(f.properties)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
