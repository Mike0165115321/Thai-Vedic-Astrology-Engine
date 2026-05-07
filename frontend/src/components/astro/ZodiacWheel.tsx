"use client";

import { useMemo } from "react";
import { SIGNS, ASPECTS } from "./data";
import { Planet, Lagna } from "@/types/chart";

type Props = {
  planets: { [key: string]: Planet } | null;
  transitPlanets: { [key: string]: Planet } | null;
  natalLagna: Lagna | null;
  transitLagna: Lagna | null;
  natalHouses: { [key: string]: number } | null;
  transitHouses: { [key: string]: number } | null;
  enabledAspects: string[];
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
};

const SIZE = 560;
const CENTER = SIZE / 2;
const R_OUTER = 280;
const R_SIGNS = 250;
const R_TRANSITS = 225; // Clearly outside the house grid
const R_HOUSES = 200;
const R_PLANETS = 160; // Natal planets
const R_INNER = 110;

const HOUSE_NAMES_TH = [
  "ตนุ", "กฎุมพะ", "สหัชชะ", "พันธุ", "ปุตตะ", "อริ", 
  "ปัตนิ", "มรณะ", "ศุภะ", "กัมมะ", "ลาภะ", "วินาศ"
];

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
  // Center Aries (15°) at the TOP (12 o'clock), counter-clockwise
  const rad = ((75 + deg) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER - r * Math.sin(rad) };
};

const resolveOverlaps = (list: any[], baseRadius: number) => {
    if (list.length === 0) return [];
    
    // Sort by longitude to detect neighbors
    const sorted = [...list].sort((a, b) => a.lon - b.lon);
    const threshold = 7.5; // Degree threshold for overlap
    const step = 24;      // Distance to stagger radially
    
    const results = [];
    let stackLevel = 0;
    
    for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        if (i > 0) {
            const diff = p.lon - sorted[i-1].lon;
            if (diff < threshold) {
                stackLevel += 1;
            } else {
                stackLevel = 0;
            }
        }
        
        // Alternating pattern: 0, -1, 1, -2, 2...
        let offset = 0;
        if (stackLevel > 0) {
            const dir = stackLevel % 2 === 0 ? 1 : -1;
            const depth = Math.ceil(stackLevel / 2);
            offset = dir * depth * step;
        }
        
        results.push({ ...p, visualRadius: baseRadius + offset });
    }
    return results;
};

export function ZodiacWheel({ planets, transitPlanets, natalLagna, transitLagna, natalHouses, transitHouses, enabledAspects, selectedPlanet, onSelectPlanet }: Props) {
  const natalList = useMemo(() => {
    let list: any[] = [];
    if (planets) {
        list = Object.entries(planets).map(([name, p]) => ({
            id: `n-${name}`,
            name,
            symbol: p.symbol || name.substring(0, 2),
            lon: p.longitude,
            retro: p.is_retrograde,
            color: getPlanetColor(name),
            isTransit: false,
            isLagna: false
        }));
    }
    if (natalLagna) {
        list.push({
            id: 'n-lagna',
            name: 'Lagna',
            symbol: 'ลั',
            lon: natalLagna.longitude,
            retro: false,
            color: 'var(--warning)',
            isTransit: false,
            isLagna: true
        });
    }
    return resolveOverlaps(list, R_PLANETS);
  }, [planets, natalLagna]);

  const transitList = useMemo(() => {
    let list: any[] = [];
    if (transitPlanets) {
        list = Object.entries(transitPlanets).map(([name, p]) => ({
            id: `t-${name}`,
            name,
            symbol: p.symbol || name.substring(0, 2),
            lon: p.longitude,
            retro: p.is_retrograde,
            color: getPlanetColor(name),
            isTransit: true,
            isLagna: false
        }));
    }
    if (transitLagna) {
        list.push({
            id: 't-lagna',
            name: 'TransitLagna',
            symbol: 'ลั',
            lon: transitLagna.longitude,
            retro: false,
            color: 'var(--info)',
            isTransit: true,
            isLagna: true
        });
    }
    return resolveOverlaps(list, R_TRANSITS);
  }, [transitPlanets, transitLagna]);

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

  const ascDeg = natalLagna?.longitude || 0;

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

      {/* House cusps and labels (aligned with signs for Whole Sign) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const signNum = i + 1;
        // Find which house number this sign represents in the natal chart
        let houseNum = 0;
        if (natalHouses) {
          const entry = Object.entries(natalHouses).find(([h, s]) => s === signNum);
          if (entry) houseNum = parseInt(entry[0]);
        }

        const cuspAngle = i * 30;
        const a = polar(cuspAngle, R_HOUSES);
        const b = polar(cuspAngle, R_INNER);
        
        // House label position
        const labelAngle = i * 30 + 15;
        const pName = polar(labelAngle, (R_HOUSES + R_INNER) / 2 + 4);

        return (
          <g key={i}>
            {/* Cusp line */}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
            
            {houseNum > 0 && (
              <g opacity={0.65}>
                <text x={pName.x} y={pName.y} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--muted-foreground)">
                  {HOUSE_NAMES_TH[houseNum - 1]}
                </text>
              </g>
            )}
          </g>
        );
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

      {/* Transit planets outer ring path */}
      <circle cx={CENTER} cy={CENTER} r={R_TRANSITS} fill="none" stroke="var(--primary)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />

      {/* Planets and Lagnas (Stacked) */}
      {combinedList.map((p) => {
        const isSelected = selectedPlanet === p.name;
        const pos = polar(p.lon, p.visualRadius);
        
        return (
          <g key={p.id} 
             transform={`translate(${pos.x}, ${pos.y})`}
             className="cursor-pointer transition-all duration-300" 
             onClick={(e) => { 
                e.stopPropagation(); 
                if (!p.isLagna) onSelectPlanet(p.name); 
             }}>
              <g style={{ filter: isSelected ? "drop-shadow(0 0 8px var(--primary))" : "none" }}>
                {/* Background glow */}
                <circle cx={0} cy={0} r={p.isTransit ? 10 : 14} fill={p.color} opacity={isSelected || p.isLagna ? 0.3 : 0.1} />
                
                {/* Icon circle */}
                <circle 
                  cx={0} cy={0} r={p.isTransit ? 8 : 12} 
                  fill="var(--background)" 
                  stroke={p.color} 
                  strokeWidth={isSelected || p.isLagna ? 2 : 1}
                  opacity={p.isTransit ? 0.8 : 1}
                />
                
                {/* Symbol */}
                <text
                  textAnchor="middle"
                  dy={p.isTransit ? "3.5" : "4.5"}
                  fontSize={p.isTransit ? "10" : "13"}
                  fill={p.color}
                  fontWeight={p.isLagna ? 900 : 700}
                  className="select-none"
                >
                  {p.symbol}
                </text>

                {/* Retrograde indicator */}
                {p.retro && (
                  <text x="6" y="-6" fontSize="8" fill="var(--destructive)" fontWeight="bold">℞</text>
                )}

                {/* Transit badge */}
                {p.isTransit && !p.isLagna && (
                  <circle cx="6" cy="6" r="2" fill="var(--primary)" />
                )}
              </g>
          </g>
        );
      })}

      {/* Center crest */}
      <circle cx={CENTER} cy={CENTER} r={56} fill="oklch(0.18 0.03 270)" stroke="var(--primary)" strokeOpacity={0.4} />
      <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" letterSpacing="2">
        {planets ? "พื้นดวง" : "ดวงจร"}
      </text>
      <text x={CENTER} y={CENTER + 14} textAnchor="middle" fontSize="14" fill="var(--primary)" fontWeight={600}>
        {(natalLagna && natalLagna.sign && SIGNS[natalLagna.sign - 1]) ? `${SIGNS[natalLagna.sign - 1].name_th} ${(natalLagna.longitude % 30).toFixed(1)}°` : "SKY MAP"}
      </text>
    </svg>
  );
}