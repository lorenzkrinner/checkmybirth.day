"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Location } from "./LocationSearch";

type Hourly = {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
};

type ArchiveResponse = {
  hourly: Hourly;
  daily: {
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
};

// WMO weather codes → emoji + label + gradient
function weatherFor(code: number, isNight = false) {
  if (code === 0)
    return {
      icon: isNight ? "🌙" : "☀️",
      label: isNight ? "Clear" : "Sunny",
      bg: isNight
        ? "from-indigo-900 via-indigo-700 to-blue-600"
        : "from-sky-400 via-sky-500 to-blue-500",
    };
  if (code <= 2)
    return {
      icon: isNight ? "☁️" : "⛅",
      label: "Partly cloudy",
      bg: "from-sky-400 via-blue-400 to-blue-500",
    };
  if (code === 3)
    return { icon: "☁️", label: "Cloudy", bg: "from-slate-400 via-slate-500 to-slate-600" };
  if (code <= 48)
    return { icon: "🌫️", label: "Foggy", bg: "from-stone-400 via-stone-500 to-stone-600" };
  if (code <= 67)
    return { icon: "🌧️", label: "Rainy", bg: "from-slate-500 via-slate-600 to-slate-700" };
  if (code <= 77)
    return { icon: "❄️", label: "Snow", bg: "from-slate-300 via-slate-400 to-slate-500" };
  if (code <= 82)
    return { icon: "🌦️", label: "Showers", bg: "from-slate-500 via-slate-600 to-slate-700" };
  return { icon: "⛈️", label: "Thunderstorm", bg: "from-slate-700 via-slate-800 to-slate-900" };
}

const HOURS = [0, 6, 9, 12, 15, 18, 21];

export function WeatherWidget({
  location,
  date,
}: {
  location: Location;
  date: string;
}) {
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weathercode&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=celsius&timezone=auto`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.reason || "No weather data");
          toast.error("Weather unavailable", { description: d.reason });
        } else {
          setData(d);
        }
      });
  }, [location, date]);

  if (error) {
    return (
      <div className="rounded-3xl bg-stone-200 text-stone-600 p-6 text-center">
        No weather data available for this location & date.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-3xl bg-stone-200 h-56 animate-pulse" />
    );
  }

  const dayCode = data.daily.weathercode[0];
  const high = Math.round(data.daily.temperature_2m_max[0]);
  const low = Math.round(data.daily.temperature_2m_min[0]);
  const noonIdx = data.hourly.time.findIndex((t) => t.endsWith("T12:00"));
  const noonTemp = noonIdx >= 0 ? Math.round(data.hourly.temperature_2m[noonIdx]) : high;
  const day = weatherFor(dayCode);

  const city = location.label.split(",")[0];

  const sunset = data.daily.sunset[0]?.split("T")[1]?.slice(0, 5);
  const sunrise = data.daily.sunrise[0]?.split("T")[1]?.slice(0, 5);

  return (
    <div
      className={`rounded-3xl bg-gradient-to-b ${day.bg} text-white p-6 shadow-xl`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-2xl font-medium">{city}</div>
          <div className="text-6xl font-light tracking-tight mt-1">
            {noonTemp}°
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl">{day.icon}</div>
          <div className="text-sm font-medium mt-2">{day.label}</div>
          <div className="text-xs opacity-80">
            H:{high}° L:{low}°
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center pt-4 border-t border-white/20">
        {HOURS.map((h) => {
          const idx = data.hourly.time.findIndex((t) =>
            t.endsWith(`T${String(h).padStart(2, "0")}:00`)
          );
          if (idx < 0) return <div key={h} />;
          const temp = Math.round(data.hourly.temperature_2m[idx]);
          const code = data.hourly.weathercode[idx];
          const isNight = h < 6 || h > 19;
          const w = weatherFor(code, isNight);
          return (
            <div key={h} className="flex flex-col items-center gap-1">
              <div className="text-xs opacity-90">
                {h === 0 ? "12AM" : h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h - 12}PM`}
              </div>
              <div className="text-xl">{w.icon}</div>
              <div className="text-sm font-medium">{temp}°</div>
            </div>
          );
        })}
      </div>

      {(sunrise || sunset) && (
        <div className="flex justify-between text-xs opacity-80 mt-4 pt-3 border-t border-white/20">
          {sunrise && <span>🌅 Sunrise {sunrise}</span>}
          {sunset && <span>🌇 Sunset {sunset}</span>}
        </div>
      )}
    </div>
  );
}
