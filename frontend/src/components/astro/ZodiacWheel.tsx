"use client";

import { useMemo } from "react";
import { SIGNS, ASPECTS } from "./data";
import { Planet, Lagna } from "@/types/chart";

type Props = {
  planets: { [key: string]: Planet } | null;
  lagna: Lagna | null;
  transitOffset: number; // degrees added to all planets for transit scrub
  enabledAspects: string[];
};

const SIZE = 560;
const CENTER = SIZE / 2;
const R_OUTER = 270;
const R_SIGNS = 240;
const R_HOUSES = 200;
const R_PLANETS = 168;
const R_INNER = 120;

const polar = (deg: number, r: number) => {
  // 0° Aries on the left (9 o'clock), counter-clockwise (astro convention)
  const rad = ((180 - deg) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER - r * Math.sin(rad) };
};

export function ZodiacWheel({ planets, lagna, transitOffset, enabledAspects }: Props) {
  const planetList = useMemo(() => {
    if (!planets) return [];
    return Object.entries(planets).map(([name, p]) => ({
      name,
      symbol: p.symbol || name.substring(0, 2),
      lon: (p.longitude + transitOffset) % 360,
      retro: p.is_retrograde,
      color: name === "Sun" ? "var(--warning)" : 
             name === "Moon" ? "#cfd6e4" : 
             name === "Mars" ? "var(--destructive)" :
             name === "Jupiter" ? "var(--primary)" :
             name === "Venus" ? "#f5b8e0" :
             name === "Mercury" ? "var(--info)" :
             name === "Saturn" ? "#94a3b8" :
             "var(--accent)"
    }));
  }, [planets, transitOffset]);

  const aspectLines = useMemo(() => {
    const lines: { a: any; b: any; type: string; color: string }[] = [];
    if (planetList.length < 2) return lines;

    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const diff = Math.abs(planetList[i].lon - planetList[j].lon);
        const d = diff > 180 ? 360 - diff : diff;
        for (const a of ASPECTS) {
          if (Math.abs(d - a.angle) <= 5 && enabledAspects.includes(a.type)) {
            lines.push({ a: planetList[i], b: planetList[j], type: a.type, color: a.color });
          }
        }
      }
    }
    return lines;
  }, [planetList, enabledAspects]);

  const ascDeg = lagna?.longitude || 0;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.22 0.04 280)" />
          <stop offset="60%" stopColor="oklch(0.18 0.025 260)" />
          <stop offset="100%" stopColor="oklch(0.14 0.02 260)" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill="url(#wheelBg)" stroke="var(--border)" />
      <circle cx={CENTER} cy={CENTER} r={R_SIGNS} fill="none" stroke="var(--border)" />
      <circle cx={CENTER} cy={CENTER} r={R_HOUSES} fill="none" stroke="var(--border)" strokeDasharray="2 4" />
      <circle cx={CENTER} cy={CENTER} r={R_INNER} fill="none" stroke="var(--border)" />

      {/* Sign sectors */}
      {SIGNS.map((s, i) => {
        const start = polar(i * 30, R_OUTER);
        const end = polar((i + 1) * 30, R_OUTER);
        const startIn = polar(i * 30, R_SIGNS);
        const path = `M ${startIn.x} ${startIn.y} L ${start.x} ${start.y} A ${R_OUTER} ${R_OUTER} 0 0 0 ${end.x} ${end.y} L ${polar((i+1)*30, R_SIGNS).x} ${polar((i+1)*30, R_SIGNS).y} A ${R_SIGNS} ${R_SIGNS} 0 0 1 ${startIn.x} ${startIn.y} Z`;
        const fill = i % 2 === 0 ? "oklch(0.22 0.025 260 / 0.7)" : "oklch(0.18 0.02 260 / 0.5)";
        const labelPos = polar(i * 30 + 15, (R_OUTER + R_SIGNS) / 2);
        return (
          <g key={s.name}>
            <path d={path} fill={fill} stroke="var(--border)" strokeWidth={0.5} />
            <text x={labelPos.x} y={labelPos.y + 6} textAnchor="middle" fontSize="18"
              fill={s.element === "fire" ? "var(--destructive)" :
                    s.element === "earth" ? "var(--success)" :
                    s.element === "air" ? "var(--info)" : "var(--accent)"}>
              {s.symbol}
            </text>
          </g>
        );
      })}

      {/* Degree ticks */}
      {Array.from({ length: 360 }).map((_, deg) => {
        const inner = polar(deg, R_SIGNS);
        const outer = polar(deg, deg % 10 === 0 ? R_SIGNS - 10 : deg % 5 === 0 ? R_SIGNS - 6 : R_SIGNS - 3);
        return <line key={deg} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="var(--muted-foreground)" strokeOpacity={deg % 10 === 0 ? 0.55 : 0.25} strokeWidth={0.5} />;
      })}

      {/* House cusps (equal house for now) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = polar(i * 30, R_HOUSES);
        const b = polar(i * 30, R_INNER);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeDasharray="3 3" />;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const p = polar(i * 30 + 15, (R_HOUSES + R_INNER) / 2 + 8);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{i + 1}</text>;
      })}

      {/* Aspect lines */}
      <g opacity={0.85}>
        {aspectLines.map((l, i) => {
          const a = polar(l.a.lon, R_INNER);
          const b = polar(l.b.lon, R_INNER);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={l.color} strokeOpacity={0.55} strokeWidth={1.2} />;
        })}
      </g>

      {/* Planets */}
      {planetList.map((p) => {
        const pos = polar(p.lon, R_PLANETS);
        const tick1 = polar(p.lon, R_SIGNS - 2);
        const tick2 = polar(p.lon, R_HOUSES + 2);
        return (
          <g key={p.name}>
            <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke={p.color} strokeWidth={1.2} />
            <circle cx={pos.x} cy={pos.y} r={13} fill="oklch(0.16 0.02 260)" stroke={p.color} strokeWidth={1.2} filter="url(#glow)" />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="14" fill={p.color}>{p.symbol}</text>
            {p.retro && <text x={pos.x + 12} y={pos.y - 8} fontSize="8" fill="var(--destructive)">℞</text>}
          </g>
        );
      })}

      {/* Lagna marker */}
      {lagna && (
        <g>
            <line 
                x1={polar(ascDeg, R_SIGNS).x} 
                y1={polar(ascDeg, R_SIGNS).y} 
                x2={polar(ascDeg, R_INNER).x} 
                y2={polar(ascDeg, R_INNER).y} 
                stroke="var(--warning)" 
                strokeWidth={2} 
            />
        </g>
      )}

      {/* Center crest */}
      <circle cx={CENTER} cy={CENTER} r={56} fill="oklch(0.18 0.03 270)" stroke="var(--primary)" strokeOpacity={0.4} />
      <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" letterSpacing="2">NATAL</text>
      <text x={CENTER} y={CENTER + 14} textAnchor="middle" fontSize="14" fill="var(--primary)" fontWeight={600}>
        {lagna ? `${SIGNS[lagna.sign_index].symbol} ${(lagna.longitude % 30).toFixed(1)}°` : "—"}
      </text>
    </svg>
  );
}