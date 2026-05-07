"use client";

import { useState, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Filter } from "lucide-react";
import { ZodiacWheel } from "./ZodiacWheel";
import { ASPECTS } from "./data";
import { ChartData } from "@/types/chart";

type Props = {
  chartData: ChartData | null;
  transitData: ChartData | null;
  loading: boolean;
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onTransitDateChange: (dateOrAge: Date | number) => void;
  chartType: "D1" | "D3" | "D9" | "CAL";
};

export function CenterPanel({ chartData, transitData, loading, selectedPlanet, onSelectPlanet, onTransitDateChange, chartType }: Props) {
  const [age, setAge] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showTransit, setShowTransit] = useState(true);
  const [enabled, setEnabled] = useState<string[]>(ASPECTS.map((a) => a.type));

  const toggle = (t: string) =>
    setEnabled((e) => (e.includes(t) ? e.filter((x) => x !== t) : [...e, t]));

  // Helper to get divisional longitudes for rendering
  const getDivisionalData = (data: ChartData | null, type: string) => {
    if (!data) return null;
    if (type === "D1") return data;
    
    const divKey = type.toLowerCase() as "d3" | "d9";
    const divSource = data[divKey];

    if (!divSource) return data;

    // Create a new planets object with divisional positions
    const divPlanets: any = {};
    Object.keys(data.planets).forEach(name => {
        const divInfo = divSource[name];
        if (divInfo) {
            // Map sign (1-12) to degree (0-360)
            // sign 1 (Aries) = 0°, sign 2 (Taurus) = 30°, etc.
            const signBase = (divInfo.sign - 1) * 30;
            // Add a small offset based on the divisional degree to show relative position within the sign
            divPlanets[name] = {
                ...data.planets[name],
                longitude: signBase + (divInfo.degree || 15) // Use 15 as center if degree missing
            };
        } else {
            divPlanets[name] = data.planets[name];
        }
    });

    // Adjust Lagna for the wheel
    const lagnaKey = type.toLowerCase() + "_lagna" as "d3_lagna" | "d9_lagna";
    const divLagnaRaw = (data as any)[lagnaKey];
    let divLagna = data.lagna;
    
    if (divLagnaRaw) {
        const signBase = (divLagnaRaw.sign - 1) * 30;
        divLagna = {
            ...data.lagna,
            sign: divLagnaRaw.sign,
            longitude: signBase + (divLagnaRaw.degree || 15)
        };
    }

    return { ...data, planets: divPlanets, lagna: divLagna };
  };

  const displayChartData = useMemo(() => getDivisionalData(chartData, chartType), [chartData, chartType]);
  const displayTransitData = useMemo(() => getDivisionalData(transitData, chartType), [transitData, chartType]);

  return (
    <section className="flex flex-col bg-(image:--gradient-cosmic) relative">
      {/* Aspect controls */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card/40 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">องศาเล็ง (Aspects)</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setShowTransit(!showTransit)}
            className={`flex items-center gap-1.5 rounded border px-2 py-1 transition ${
              showTransit ? "border-primary/50 bg-primary/10 text-primary" : "border-border/50 bg-transparent text-muted-foreground/60"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showTransit ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
            <span>ดาวจร</span>
          </button>
          <div className="mx-1 h-6 w-px bg-border/40" />
          {ASPECTS.map((a) => {
            const on = enabled.includes(a.type);
            return (
              <button
                key={a.type}
                onClick={() => toggle(a.type)}
                className={`flex items-center gap-1.5 rounded border px-2 py-1 transition ${
                  on ? "border-border bg-muted/60 text-foreground" : "border-border/50 bg-transparent text-muted-foreground/60"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: a.color, opacity: on ? 1 : 0.4 }} />
                <span className="font-mono">{a.angle}°</span>
                <span className="hidden md:inline">{a.type}</span>
              </button>
            );
          })}
        </div>
        <div className="hidden font-mono text-[10px] text-muted-foreground md:block">
          ระยะเอื้อม ≤ 5°  ·  ระบบนิรายนะ  ·  ลาหิรี
        </div>
      </div>

      {/* Wheel */}
      <div className="relative flex flex-1 items-center justify-center p-4">
        <div className="aspect-square h-full max-h-[calc(100vh-220px)] w-auto">
          <ZodiacWheel 
            planets={displayChartData?.planets || null} 
            transitPlanets={showTransit ? (displayTransitData?.planets || null) : null}
            natalLagna={displayChartData?.lagna || null}
            transitLagna={showTransit ? (displayTransitData?.lagna || null) : null}
            natalHouses={displayChartData?.houses || null}
            transitHouses={showTransit ? (displayTransitData?.houses || null) : null}
            enabledAspects={enabled} 
            selectedPlanet={selectedPlanet}
            onSelectPlanet={onSelectPlanet}
          />
        </div>

        {chartData && (
          <>
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-border bg-card/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
              วันกำเนิด · {chartData.julian_date.toFixed(4)}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 rounded border border-border bg-card/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
              ลัคนา · {chartData.lagna.longitude.toFixed(2)}°
            </div>
          </>
        )}

        {transitData && !chartData && (
          <div className="pointer-events-none absolute left-3 top-3 rounded border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary backdrop-blur animate-pulse">
            ดวงจรปัจจุบัน · {(transitData.julian_date).toFixed(4)}
          </div>
        )}

        {!chartData && !transitData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 italic font-mono uppercase tracking-widest text-center px-10">
            ระบบพร้อมทำงาน กรุณากรอกข้อมูลเพื่อคำนวณตำแหน่งดาว
          </div>
        )}
      </div>

      {/* Transit scrubber */}
      <div className="border-t border-border bg-card/60 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="font-mono text-xs text-foreground flex items-center gap-3">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">อายุ (Age):</span>
            <div className="flex items-center gap-1">
                <input 
                    type="number" 
                    value={Math.floor(age)} 
                    onChange={(e) => {
                        const v = Math.max(0, Math.min(120, parseFloat(e.target.value) || 0));
                        setAge(v + (age % 1));
                        onTransitDateChange(v + (age % 1));
                    }}
                    className="w-10 bg-primary/10 border border-primary/30 rounded px-1 py-0.5 text-center text-primary font-bold"
                />
                <span className="text-muted-foreground">ปี</span>
                <span className="text-primary font-bold ml-1">{Math.floor((age % 1) * 12)}</span>
                <span className="text-muted-foreground">ด.</span>
            </div>
            <span className="mx-2 text-border">|</span>
            <span className="text-muted-foreground">วันที่: </span>
            <span className="bg-muted/30 px-2 py-0.5 rounded border border-border/50">
                {transitData ? (() => {
                    const d = new Date(transitData.julian_date * 86400000 - 210866803200000);
                    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear() + 543}`;
                })() : "..."}
            </span>
          </div>
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            <button 
                onClick={() => { const v = age + (1/365.25); setAge(v); onTransitDateChange(v); }}
                className="rounded border border-border px-1.5 py-0.5 hover:text-foreground hover:bg-muted"
            >+1 วัน</button>
            <button 
                onClick={() => { const v = age + (1/12); setAge(v); onTransitDateChange(v); }}
                className="rounded border border-border px-1.5 py-0.5 hover:text-foreground hover:bg-muted"
            >+1 ด.</button>
            <button 
                onClick={() => { const v = age + 1; setAge(v); onTransitDateChange(v); }}
                className="rounded border border-border px-1.5 py-0.5 hover:text-foreground hover:bg-muted"
            >+1 ปี</button>
          </div>
        </div>
        <input
          type="range" min={0} max={120} step={0.1}
          value={age}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setAge(v);
            onTransitDateChange(v);
          }}
          className="w-full accent-[var(--primary)]"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-tighter">
          <span>0 ปี (แรกเกิด)</span><span>30 ปี</span><span>60 ปี</span><span>90 ปี</span><span>120 ปี</span>
        </div>
      </div>
    </section>
  );
}