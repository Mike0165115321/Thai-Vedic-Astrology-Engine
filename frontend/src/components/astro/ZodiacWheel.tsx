"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
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
  isSynastry?: boolean;
  synastryFocus?: "A" | "B" | "Both";
};

const SIZE = 560;
const NAK_SIZE = 360 / 27;
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
  if (name === "Sun") return "#fbbf24"; // Bright Sun
  if (name === "Moon") return "#e2e8f0"; // Bright Moon
  if (name === "Mars") return "#f87171"; // Mars Red
  if (name === "Mercury") return "#34d399"; // Mercury Green
  if (name === "Jupiter") return "#fb923c"; // Jupiter Orange/Gold
  if (name === "Venus") return "#f472b6"; // Venus Pink
  if (name === "Saturn") return "#94a3b8"; // Saturn Slate
  if (name === "Rahu") return "#f59e0b"; // Rahu Amber
  if (name === "Ketu") return "#fbbf24"; // Ketu Gold
  if (name === "Uranus") return "#a78bfa"; // Uranus Violet
  return "#818cf8"; // Default Indigo
};

const polar = (deg: number, r: number) => {
  // Rotate by -15° so that the center of Aries (15°) is at the top (90°)
  // 0° (Aries) = 90° (Top), Counter-Clockwise
  const rad = ((90 + deg - 15) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER - r * Math.sin(rad) };
};

const resolveOverlaps = (list: any[], baseRadius: number) => {
    if (list.length === 0) return [];
    
    // Sort a copy to detect neighbors
    const sorted = [...list].sort((a, b) => a.lon - b.lon);
    const threshold = 12; // Increased from 8 to 12 for better clarity
    const step = 25;     // Increased from 22 to 25 for clearer vertical separation
    
    const radiusMap: { [key: string]: number } = {};
    const usedLevels: number[] = [];
    
    for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        let stackLevel = 0;
        
        // Check previous planets in a sliding window to find a free level
        // We look at the last 3 planets to see if we're too close to any of them
        const lookBack = 4;
        let occupiedLevels = new Set<number>();
        
        for (let j = 1; j <= lookBack; j++) {
            if (i - j >= 0) {
                const prev = sorted[i - j];
                const diff = Math.abs(p.lon - prev.lon);
                if (diff < threshold) {
                    occupiedLevels.add(usedLevels[i - j]);
                }
            }
        }

        // Find the first level (0, 1, -1, 2, -2...) that isn't occupied by a nearby planet
        const levelsToTry = [0, 1, -1, 2, -2, 3, -3];
        for (const level of levelsToTry) {
            if (!occupiedLevels.has(level)) {
                stackLevel = level;
                break;
            }
            stackLevel = level; // Fallback to furthest if all busy
        }
        
        usedLevels[i] = stackLevel;
        radiusMap[p.id] = baseRadius + (stackLevel * step);
    }
    
    // Return original list with updated visualRadius to maintain stable DOM order
    return list.map(p => ({ ...p, visualRadius: radiusMap[p.id] || baseRadius }));
};

export function ZodiacWheel({ 
  planets, transitPlanets, natalLagna, transitLagna, 
  natalHouses, transitHouses, enabledAspects, 
  selectedPlanet, onSelectPlanet, isSynastry, synastryFocus = "Both" 
}: Props) {
  const natalList = useMemo(() => {
    let list: any[] = [];
    if (planets) {
        list = Object.entries(planets).map(([name, p]) => ({
            id: `n-${name}`,
            name,
            symbol: p.symbol || name.substring(0, 2),
            lon: p.longitude,
            retro: p.is_retrograde,
            color: isSynastry ? "#3b82f6" : getPlanetColor(name), // Fixed Blue for Person A
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
            color: isSynastry ? "#3b82f6" : '#fbbf24',
            isTransit: false,
            isLagna: true
        });
    }
    return resolveOverlaps(list, R_PLANETS);
  }, [planets, natalLagna, isSynastry]);

  const transitList = useMemo(() => {
    let list: any[] = [];
    if (transitPlanets) {
        list = Object.entries(transitPlanets).map(([name, p]) => ({
            id: `t-${name}`,
            name,
            symbol: p.symbol || name.substring(0, 2),
            lon: p.longitude,
            retro: p.is_retrograde,
            color: isSynastry ? "#ffffff" : getPlanetColor(name), // Fixed White for Person B
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
            color: isSynastry ? "#ffffff" : '#34d399',
            isTransit: true,
            isLagna: true
        });
    }
    return resolveOverlaps(list, R_TRANSITS);
  }, [transitPlanets, transitLagna, isSynastry]);

  const combinedList = useMemo(() => {
    return [...natalList, ...transitList];
  }, [natalList, transitList]);

  const aspectLines = useMemo(() => {
    const lines: { a: any; b: any; type: string; color: string }[] = [];
    
    const calculateFor = (list1: any[], list2?: any[]) => {
        const targetList = list2 || list1;
        const isSelf = !list2;
        
        for (let i = 0; i < list1.length; i++) {
            const startIdx = isSelf ? i + 1 : 0;
            for (let j = startIdx; j < targetList.length; j++) {
                if (isSelf && i === j) continue;
                const aPlanet = list1[i];
                const bPlanet = targetList[j];
                
                const diff = Math.abs(aPlanet.lon - bPlanet.lon);
                const d = diff > 180 ? 360 - diff : diff;
                
                for (const a of ASPECTS) {
                    if (Math.abs(d - a.angle) <= 5 && enabledAspects.includes(a.type)) {
                        lines.push({ a: aPlanet, b: bPlanet, type: a.type, color: a.color });
                    }
                }
            }
        }
    };

    if (isSynastry) {
        // Person A individual aspects
        if (synastryFocus === "A" || synastryFocus === "Both") {
            calculateFor(natalList);
        }
        // Person B individual aspects
        if (synastryFocus === "B" || synastryFocus === "Both") {
            calculateFor(transitList);
        }
        // Inter-person aspects (The core Synastry)
        if (synastryFocus === "Both") {
            calculateFor(natalList, transitList);
        }
    } else {
        const source = planets ? natalList : transitList;
        calculateFor(source);
    }
    
    return lines;
  }, [natalList, transitList, isSynastry, synastryFocus, enabledAspects, planets]);

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
      
      {/* Nakshatra Ticks (27 Divisions) */}
      {Array.from({ length: 27 }).map((_, i) => {
        const angle = i * NAK_SIZE;
        const p1 = polar(angle, R_OUTER);
        const p2 = polar(angle, R_OUTER + 8);
        return (
          <line key={`nak-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--primary)" strokeWidth="1" opacity={0.4} />
        );
      })}
      <circle cx={CENTER} cy={CENTER} r={R_OUTER + 8} fill="none" stroke="var(--border)" strokeWidth="0.5" opacity={0.3} />

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
            <text x={polar(i * 30 + 15, (R_HOUSES + R_INNER) / 2 + 4).x} y={polar(i * 30 + 15, (R_HOUSES + R_INNER) / 2 + 4).y} textAnchor="middle" fontSize="10" fontWeight="bold"
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
            {/* House cusp line (Now Outer and Solid) */}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" opacity={0.4} strokeWidth="1" />
            
            {houseNum > 0 && (
              <g opacity={0.85}>
                <text x={polar(i * 30 + 15, (R_OUTER + R_SIGNS) / 2 + 4).x} y={polar(i * 30 + 15, (R_OUTER + R_SIGNS) / 2 + 4).y} textAnchor="middle" fontSize="10" fontWeight="900" fill="var(--muted-foreground)">
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

      {/* Outer transit ring for reference */}
      <circle cx={CENTER} cy={CENTER} r={R_TRANSITS} fill="none" stroke="var(--primary)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />

      {/* Planets and Lagnas (Stacked) */}
      {combinedList.map((p) => {
        const isSelected = selectedPlanet === p.name;
        const pos = polar(p.lon, p.visualRadius);
        
        return (
          <motion.g 
             key={p.id} 
             layout
             animate={{ x: pos.x, y: pos.y }}
             transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 20, 
                mass: 0.8
             }}
             className="cursor-pointer"
             style={{
                opacity: (isSynastry && synastryFocus !== "Both") 
                  ? (p.isTransit ? (synastryFocus === "B" ? 1 : 0.15) : (synastryFocus === "A" ? 1 : 0.15))
                  : 1
             }}
             onClick={(e) => { 
                e.stopPropagation(); 
                if (!p.isLagna) onSelectPlanet(p.name); 
             }}>
              <g style={{ filter: isSelected ? `drop-shadow(0 0 8px ${p.color})` : "none" }}>
                {/* Background glow */}
                <circle cx={0} cy={0} r={(p.isTransit && !isSynastry) ? 10 : 14} fill={p.color} opacity={isSelected || p.isLagna ? 0.3 : 0.1} />
                
                {/* Icon circle */}
                <circle 
                  cx={0} cy={0} r={(p.isTransit && !isSynastry) ? 8 : 12} 
                  fill="var(--background)" 
                  stroke={p.color} 
                  strokeWidth={isSelected || p.isLagna ? 2 : 1}
                  opacity={(p.isTransit && !isSynastry) ? 0.8 : 1}
                />
                
                {/* Symbol */}
                <text
                  textAnchor="middle"
                  dy={(p.isTransit && !isSynastry) ? "3.5" : "4.5"}
                  fontSize={(p.isTransit && !isSynastry) ? "10" : "13"}
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

                {/* Transit badge (Always show for Person B in Synastry) */}
                {p.isTransit && !p.isLagna && (
                  <circle cx="6" cy="6" r="2.5" fill={isSynastry ? "#ffffff" : "var(--primary)"} stroke="var(--background)" strokeWidth="0.5" />
                )}
              </g>
          </motion.g>
        );
      })}

    </svg>
  );
}