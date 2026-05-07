"use client";

import { useMemo } from "react";
import { SIGNS, ASPECTS } from "./data";
import { Planet, Lagna } from "@/types/chart";

type Props = {
  planets: { [key: string]: Planet } | null;
  transitPlanets: { [key: string]: Planet } | null;
  lagna: Lagna | null;
  transitOffset: number; 
  enabledAspects: string[];
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
};

const SIZE = 560;
const CENTER = SIZE / 2;
const R_OUTER = 270;
const R_SIGNS = 240;
const R_TRANSITS = 222; // New ring for transit planets
const R_HOUSES = 200;
const R_PLANETS = 168; // Natal planets
const R_INNER = 120;

const getPlanetColor = (name: string) => {
  return name === "Sun" ? "var(--warning)" : 
         name === "Moon" ? "#cfd6e4" : 
         name === "Mars" ? "var(--destructive)" :
         name === "Jupiter" ? "var(--primary)" :
         name === "Venus" ? "#f5b8e0" :
         name === "Mercury" ? "var(--info)" :
         name === "Saturn" ? "#94a3b8" :
         "var(--accent)";
};

const polar = (deg: number, r: number) => {
  // 0° Aries on the left (9 o'clock), counter-clockwise (astro convention)
  const rad = ((180 - deg) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER - r * Math.sin(rad) };
};

export function ZodiacWheel({ planets, transitPlanets, lagna, transitOffset, enabledAspects, selectedPlanet, onSelectPlanet }: Props) {
  const natalList = useMemo(() => {
    if (!planets) return [];
    return Object.entries(planets).map(([name, p]) => ({
      name,
      symbol: p.symbol || name.substring(0, 2),
      lon: p.longitude,
      retro: p.is_retrograde,
      color: getPlanetColor(name),
      isTransit: false
    }));
  }, [planets]);

  const transitList = useMemo(() => {
    if (!transitPlanets) return [];
    return Object.entries(transitPlanets).map(([name, p]) => ({
      name,
      symbol: p.symbol || name.substring(0, 2),
      lon: (p.longitude + transitOffset) % 360,
      retro: p.is_retrograde,
      color: getPlanetColor(name),
      isTransit: true
    }));
  }, [transitPlanets, transitOffset]);

  const combinedList = useMemo(() => [...natalList, ...transitList], [natalList, transitList]);

  const aspectLines = useMemo(() => {
    const lines: { a: any; b: any; type: string; color: string }[] = [];
    const source = planets ? natalList : transitList;
    if (source.length < 2) return lines;

    for (let i = 0; i < source.length; i++) {
      for (let j = i + 1; j < source.length; j++) {
        const diff = Math.abs(source[i].lon - source[j].lon);
        const d = diff > 180 ? 360 - diff : diff;
        for (const a of ASPECTS) {
          if (Math.abs(d - a.angle) <= 5 && enabledAspects.includes(a.type)) {
            lines.push({ a: source[i], b: source[j], type: a.type, color: a.color });
          }
        }
      }
    }
    return lines;
  }, [natalList, transitList, planets, enabledAspects]);

  const ascDeg = lagna?.longitude || 0;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" onClick={() => onSelectPlanet(null)}>
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.22 0.04 280)" />
          <stop offset="60%" stopColor="oklch(0.18 0.025 260)" />
          <stop offset="100%" stopColor="oklch(0.14 0.02 260)" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="strongGlow"><feGaussianBlur stdDeviation="5" /></filter>
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
            <text x={labelPos.x} y={labelPos.y + 4} textAnchor="middle" fontSize="11" fontWeight="bold"
              fill={s.element === "fire" ? "var(--destructive)" :
                    s.element === "earth" ? "var(--success)" :
                    s.element === "air" ? "var(--info)" : "var(--accent)"}>
              {s.name_th}
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
          const isSelected = selectedPlanet === l.a.name || selectedPlanet === l.b.name;
          const a = polar(l.a.lon, R_INNER);
          const b = polar(l.b.lon, R_INNER);
          return (
            <line 
                key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} 
                stroke={l.color} 
                strokeOpacity={isSelected ? 1 : selectedPlanet ? 0.05 : 0.45} 
                strokeWidth={isSelected ? 2 : 1.2} 
                className="transition-all duration-300"
            />
          );
        })}
      </g>

      {/* Planets */}
      {combinedList.map((p) => {
        const isSelected = selectedPlanet === p.name;
        const radius = p.isTransit ? R_TRANSITS : R_PLANETS;
        const pos = polar(p.lon, radius);
        const tick1 = polar(p.lon, R_SIGNS - 2);
        const tick2 = polar(p.lon, p.isTransit ? R_TRANSITS + 10 : R_HOUSES + 2);
        
        return (
          <g key={`${p.isTransit ? 't-' : 'n-'}${p.name}`} 
             className="cursor-pointer transition-all duration-300" 
             onClick={(e) => { e.stopPropagation(); onSelectPlanet(p.name); }}>
            {!p.isTransit && (
                <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke={p.color} strokeWidth={isSelected ? 2.5 : 1.2} opacity={selectedPlanet && !isSelected ? 0.3 : 1} />
            )}
            <circle cx={pos.x} cy={pos.y} r={p.isTransit ? (isSelected ? 12 : 9) : (isSelected ? 16 : 13)} 
                fill={p.isTransit ? "transparent" : "oklch(0.16 0.02 260)"} 
                stroke={p.color} 
                strokeWidth={isSelected ? 2.5 : p.isTransit ? 2 : 1.2} 
                strokeDasharray={p.isTransit ? "2 1" : "none"}
                filter={isSelected ? "url(#strongGlow)" : "url(#glow)"}
                className="transition-all duration-300"
            />
            <text x={pos.x} y={pos.y + (p.isTransit ? 4 : 5)} textAnchor="middle" fontSize={p.isTransit ? (isSelected ? "11" : "9") : (isSelected ? "16" : "14")} fill={p.color} fontWeight={isSelected ? "bold" : "normal"}>{p.symbol}</text>
            {p.retro && <text x={pos.x + (p.isTransit ? 8 : 12)} y={pos.y - 8} fontSize="8" fill="var(--destructive)">℞</text>}
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
      <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" letterSpacing="2">
        {planets ? "NATAL" : "LIVE"}
      </text>
      <text x={CENTER} y={CENTER + 14} textAnchor="middle" fontSize="14" fill="var(--primary)" fontWeight={600}>
        {(lagna && lagna.sign && SIGNS[lagna.sign - 1]) ? `${SIGNS[lagna.sign - 1].name_th} ${(lagna.longitude % 30).toFixed(1)}°` : "SKY MAP"}
      </text>
    </svg>
  );
}