"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SIGNS, ASPECTS } from "./data";
import { Planet, Lagna } from "@/types/chart";

type Props = {
  planets: { [key: string]: Planet } | null;
  comparePlanets?: { [key: string]: Planet } | null; // Person B
  transitPlanets: { [key: string]: Planet } | null; // Real-time
  natalLagna: Lagna | null;
  compareLagna?: Lagna | null;
  transitLagna: Lagna | null;
  natalHouses: { [key: string]: number } | null;
  compareHouses?: { [key: string]: number } | null;
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
const R_TRANSITS = 225; 
const R_HOUSES = 200;
const R_PLANETS = 160; 
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
        const localThreshold = 14; 
        const step = 13;          // Reduced step to keep everything inside
        
        const lookBack = 4;
        let occupiedLevels = new Set<number>();
        
        for (let j = 1; j <= lookBack; j++) {
            if (i - j >= 0) {
                const prev = sorted[i - j];
                const diff = Math.abs(p.lon - prev.lon);
                if (diff < localThreshold) {
                    occupiedLevels.add(usedLevels[i - j]);
                }
            }
        }

        const levelsToTry = [0, 1, -1, 2, -2]; 
        for (const level of levelsToTry) {
            if (!occupiedLevels.has(level)) {
                stackLevel = level;
                break;
            }
            stackLevel = level;
        }
        
        usedLevels[i] = stackLevel;
        radiusMap[p.id] = baseRadius + (stackLevel * step);
    }
    
    // Return original list with updated visualRadius to maintain stable DOM order
    return list.map(p => ({ ...p, visualRadius: radiusMap[p.id] || baseRadius }));
};

export function ZodiacWheel({ 
  planets, comparePlanets, transitPlanets, 
  natalLagna, compareLagna, transitLagna, 
  natalHouses, compareHouses, transitHouses, 
  enabledAspects, selectedPlanet, onSelectPlanet, 
  isSynastry, synastryFocus = "Both" 
}: Props) {
  const currentSIZE = isSynastry ? 650 : 560;
  const currentCENTER = currentSIZE / 2;
  const rOuter = isSynastry ? 310 : 280;
  const rSigns = isSynastry ? 280 : 250;
  const rHouses = isSynastry ? 220 : 200;
  const rPlanets = isSynastry ? 110 : 160;
  const rCompare = isSynastry ? 180 : 180;
  const rTransits = isSynastry ? 250 : 225;
  const rInner = isSynastry ? 75 : 110;

  const dynamicPolar = (deg: number, r: number) => {
    const rad = ((90 + deg - 15) * Math.PI) / 180;
    return { x: currentCENTER + r * Math.cos(rad), y: currentCENTER - r * Math.sin(rad) };
  };

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
            color: isSynastry ? "#3b82f6" : '#fbbf24',
            isTransit: false,
            isLagna: true
        });
    }
    return resolveOverlaps(list, rPlanets);
  }, [planets, natalLagna, isSynastry, rPlanets]);

  const compareList = useMemo(() => {
    let list: any[] = [];
    if (comparePlanets) {
        list = Object.entries(comparePlanets).map(([name, p]) => ({
            id: `c-${name}`,
            name,
            symbol: p.symbol || name.substring(0, 2),
            lon: p.longitude,
            retro: p.is_retrograde,
            color: getPlanetColor(name),
            isCompare: true,
            isTransit: false,
            isLagna: false
        }));
    }
    if (compareLagna) {
        list.push({
            id: 'c-lagna',
            name: 'Lagna',
            symbol: 'ลั',
            lon: compareLagna.longitude,
            retro: false,
            color: '#f472b6', // Pink for Person B Lagna
            isCompare: true,
            isTransit: false,
            isLagna: true
        });
    }
    return resolveOverlaps(list, rCompare);
  }, [comparePlanets, compareLagna, rCompare]);

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
            isCompare: false,
            isLagna: false
        }));
    }
    if (transitLagna) {
        list.push({
            id: 't-lagna',
            name: 'Lagna',
            symbol: 'ลั',
            lon: transitLagna.longitude,
            retro: false,
            color: '#fbbf24',
            isTransit: true,
            isCompare: false,
            isLagna: true
        });
    }
    return resolveOverlaps(list, rTransits);
  }, [transitPlanets, transitLagna, rTransits]);

  const combinedList = useMemo(() => {
    return [...natalList, ...compareList, ...transitList];
  }, [natalList, compareList, transitList]);

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
            calculateFor(compareList);
        }
        // Inter-person aspects (The core Synastry)
        if (synastryFocus === "Both") {
            calculateFor(natalList, compareList);
        }
    } else {
        const source = planets ? natalList : transitList;
        calculateFor(source);
    }
    
    return lines;
  }, [natalList, compareList, transitList, isSynastry, synastryFocus, enabledAspects, planets, rInner]);

  const ascDeg = natalLagna?.longitude || 0;

  return (
    <svg viewBox={`0 0 ${currentSIZE} ${currentSIZE}`} className="w-full h-full" onClick={() => onSelectPlanet(null)}>
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.22 0.04 280)" />
          <stop offset="60%" stopColor="oklch(0.18 0.025 260)" />
          <stop offset="100%" stopColor="oklch(0.14 0.02 260)" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="strongGlow"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>

      <circle cx={currentCENTER} cy={currentCENTER} r={rOuter} fill="url(#wheelBg)" stroke="var(--border)" />
      
      {/* Nakshatra Ticks (27 Divisions) */}
      {Array.from({ length: 27 }).map((_, i) => {
        const angle = i * NAK_SIZE;
        const p1 = dynamicPolar(angle, rOuter);
        const p2 = dynamicPolar(angle, rOuter + 8);
        return (
          <line key={`nak-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--primary)" strokeWidth="1" opacity={0.4} />
        );
      })}
      <circle cx={currentCENTER} cy={currentCENTER} r={rOuter + 8} fill="none" stroke="var(--border)" strokeWidth="0.5" opacity={0.3} />

      <circle cx={currentCENTER} cy={currentCENTER} r={rSigns} fill="none" stroke="var(--border)" />
      <circle cx={currentCENTER} cy={currentCENTER} r={rHouses} fill="none" stroke="var(--border)" strokeDasharray="2 4" />
      <circle cx={currentCENTER} cy={currentCENTER} r={rInner} fill="none" stroke="var(--border)" />

      {/* Sign sectors */}
      {SIGNS.map((s, i) => {
        const start = dynamicPolar(i * 30, rOuter);
        const end = dynamicPolar((i + 1) * 30, rOuter);
        const startIn = dynamicPolar(i * 30, rSigns);
        const endIn = dynamicPolar((i + 1) * 30, rSigns);
        const path = `M ${startIn.x} ${startIn.y} L ${start.x} ${start.y} A ${rOuter} ${rOuter} 0 0 0 ${end.x} ${end.y} L ${endIn.x} ${endIn.y} A ${rSigns} ${rSigns} 0 0 1 ${startIn.x} ${startIn.y} Z`;
        const fill = i % 2 === 0 ? "oklch(0.22 0.025 260 / 0.7)" : "oklch(0.18 0.02 260 / 0.5)";
        return (
          <g key={s.name}>
            <path d={path} fill={fill} stroke="var(--border)" strokeWidth={0.5} />
            <text x={dynamicPolar(i * 30 + 15, rInner + 18).x} y={dynamicPolar(i * 30 + 15, rInner + 18).y} textAnchor="middle" fontSize="11" fontWeight="bold"
              fill={s.element === "fire" ? "var(--destructive)" :
                    s.element === "earth" ? "var(--success)" :
                    s.element === "air" ? "var(--info)" : "var(--accent)"}
              opacity={0.7}>
              {s.name_th}
            </text>
          </g>
        );
      })}

      {/* Degree ticks */}
      {Array.from({ length: 360 }).map((_, deg) => {
        const inner = dynamicPolar(deg, rSigns);
        const outer = dynamicPolar(deg, deg % 10 === 0 ? rSigns - 10 : deg % 5 === 0 ? rSigns - 6 : rSigns - 3);
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
        const a = dynamicPolar(cuspAngle, rHouses);
        const b = dynamicPolar(cuspAngle, rInner);
        
        return (
          <g key={i}>
            {/* House cusp line (Now Outer and Solid) */}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" opacity={0.4} strokeWidth="1" />
            
            {houseNum > 0 && (
              <g opacity={0.85}>
                <text x={dynamicPolar(i * 30 + 15, (rOuter + rSigns) / 2 + 4).x} y={dynamicPolar(i * 30 + 15, (rOuter + rSigns) / 2 + 4).y} textAnchor="middle" fontSize="10" fontWeight="900" fill="var(--muted-foreground)">
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
          const a = dynamicPolar(l.a.lon, rInner);
          const b = dynamicPolar(l.b.lon, rInner);
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
      <circle cx={currentCENTER} cy={currentCENTER} r={rTransits} fill="none" stroke="var(--primary)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />

      {/* Planets and Lagnas (Stacked) */}
      {combinedList.map((p) => {
        const isSelected = selectedPlanet === p.name;
        const pos = dynamicPolar(p.lon, p.visualRadius);
        
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
                  ? (p.isCompare ? (synastryFocus === "B" ? 1 : 0.15) : (p.isTransit ? 0.3 : (synastryFocus === "A" ? 1 : 0.15)))
                  : (p.isTransit ? 0.6 : 1) // Slightly dim real-time transits by default for clarity
             }}
             onClick={(e) => { 
                e.stopPropagation(); 
                if (!p.isLagna) onSelectPlanet(p.name); 
             }}>
              <g>
                {/* No background circles for maximum clarity */}
                
                {/* Planet Symbol - Large & Colored */}
                <text
                  textAnchor="middle"
                  dy="7"
                  fontSize={isSelected ? "22" : "19"}
                  fill={p.color}
                  fontWeight="900"
                  className="select-none transition-all duration-300"
                  style={{ 
                    filter: "drop-shadow(0 2px 2px black) drop-shadow(0 0 1px black)",
                    paintOrder: "stroke",
                    stroke: "black",
                    strokeWidth: isSelected ? "0.8px" : "0.5px"
                  }}
                >
                  {p.symbol}
                </text>

                {/* Retrograde indicator (Thai Style) */}
                {p.retro && (
                  <text x="12" y="-12" fontSize="10" fill="var(--destructive)" fontWeight="bold" style={{ filter: "drop-shadow(0 0 2px black)" }}>พ</text>
                )}


              </g>
          </motion.g>
        );
      })}

    </svg>
  );
}
