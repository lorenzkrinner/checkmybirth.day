import { Moon } from "lunarphase-js";

type Props = { date: Date; size?: number };

export function MoonPhase({ date, size = 80 }: Props) {
  const phase = Moon.lunarAgePercent(date);
  const phaseName = Moon.lunarPhase(date);
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * phase)) * 50);

  const r = size / 2;
  const theta = 2 * Math.PI * phase;
  const rx = Math.abs(Math.cos(theta)) * r;
  const waxing = phase < 0.5;
  const gibbous = Math.cos(theta) < 0;
  const outerSweep = waxing ? 1 : 0;
  const termSweep = gibbous ? (waxing ? 0 : 1) : waxing ? 1 : 0;

  const litPath = `M ${r} 0 A ${r} ${r} 0 1 ${outerSweep} ${r} ${size} A ${rx} ${r} 0 1 ${termSweep} ${r} 0 Z`;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={phaseName}>
        <circle cx={r} cy={r} r={r} fill="#1e1b4b" />
        <path d={litPath} fill="#fef9c3" />
        <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="#0f0a2a" strokeWidth={1} />
      </svg>
      <div className="text-sm text-stone-700 font-medium">{phaseName}</div>
      <div className="text-xs text-stone-500">{illumination}% illuminated</div>
    </div>
  );
}
