"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Filter } from "lucide-react";
import { ZodiacWheel } from "./ZodiacWheel";
import { ASPECTS } from "./data";
import { ChartData, CompareResponse } from "@/types/chart";

type Props = {
  chartData: ChartData | null;
  transitData: ChartData | null;
  displayChartData: ChartData | null;
  displayTransitData: ChartData | null;
  compareData?: CompareResponse | null;
  mode?: "Natal" | "Synastry" | "Transit";
  loading: boolean;
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onAgeChange: (age: number) => void;
  chartType: "D1" | "D3" | "D9" | "CAL";
  getDivisionalData: (data: ChartData | null, type: string) => ChartData | null;
};

export function CenterPanel({ 
  chartData, 
  transitData, 
  displayChartData, 
  displayTransitData, 
  compareData,
  mode,
  loading, 
  selectedPlanet, 
  onSelectPlanet, 
  onAgeChange,
  chartType,
  getDivisionalData
}: Props) {
  const [age, setAge] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showTransit, setShowTransit] = useState(true);
  const [enabled, setEnabled] = useState<string[]>(ASPECTS.map((a) => a.type));
  const [tDay, setTDay] = useState("");
  const [tMonth, setTMonth] = useState("");
  const [tYear, setTYear] = useState("");
  const [isEditingDate, setIsEditingDate] = useState(false);

  // Sync date string when transit data changes
  useEffect(() => {
    if (transitData && !isEditingDate) {
      const d = new Date(transitData.julian_date * 86400000 - 210866803200000);
      setTDay(d.getDate().toString().padStart(2, '0'));
      setTMonth((d.getMonth() + 1).toString().padStart(2, '0'));
      setTYear((d.getFullYear() + 543).toString());
    }
  }, [transitData, isEditingDate]);

  const handleDateSubmit = () => {
    setIsEditingDate(false);
    if (!chartData) return;
    const day = parseInt(tDay);
    const month = parseInt(tMonth);
    const year = parseInt(tYear) - 543; // Convert BE to CE
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      // Assume transit at 12:00 PM for simple date entry
      const targetDate = new Date(year, month - 1, day, 12, 0);
      const targetMs = targetDate.getTime();
      const birthMs = chartData.julian_date * 86400000 - 210866803200000;
      const diffDays = (targetMs - birthMs) / (1000 * 3600 * 24);
      const newAge = Math.max(0, diffDays / 365.2422); // Prevent negative age
      setAge(newAge);
      onAgeChange(newAge);
    }
  };

  const toggle = (t: string) =>
    setEnabled((e) => (e.includes(t) ? e.filter((x) => x !== t) : [...e, t]));

  return (
    <section className="flex flex-col h-full bg-(image:--gradient-cosmic) relative overflow-hidden">
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

      {/* Wheel Area */}
      <div className="relative flex-1 overflow-y-auto custom-scrollbar">
        {chartType === "CAL" ? (
          <div className="grid grid-cols-1 gap-12 w-full max-w-5xl mx-auto py-10 px-4">
             {/* D1 Top Center */}
             <div className="flex flex-col items-center">
                <div className="mb-2 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 backdrop-blur-sm">
                   <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-primary">ดวงราศีจักร (Natal - D1)</span>
                </div>
                <div className="aspect-square h-[420px] w-[420px]">
                  <ZodiacWheel 
                    planets={getDivisionalData(chartData, "D1")?.planets || null} 
                    transitPlanets={showTransit ? (getDivisionalData(transitData, "D1")?.planets || null) : null}
                    natalLagna={getDivisionalData(chartData, "D1")?.lagna || null}
                    transitLagna={showTransit ? (getDivisionalData(transitData, "D1")?.lagna || null) : null}
                    natalHouses={getDivisionalData(chartData, "D1")?.houses || null}
                    transitHouses={showTransit ? (getDivisionalData(transitData, "D1")?.houses || null) : null}
                    enabledAspects={enabled} 
                    selectedPlanet={selectedPlanet}
                    onSelectPlanet={onSelectPlanet}
                  />
                </div>
             </div>

             {/* D3 and D9 Bottom Row */}
             <div className="flex flex-wrap justify-center gap-12 mt-2">
                {/* D9 */}
                <div className="flex flex-col items-center group">
                   <div className="mb-2 flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">นวางศ์จักร (Navamsa - D9)</span>
                   </div>
                   <div className="aspect-square h-[280px] w-[280px]">
                     <ZodiacWheel 
                        planets={getDivisionalData(chartData, "D9")?.planets || null} 
                        transitPlanets={showTransit ? (getDivisionalData(transitData, "D9")?.planets || null) : null}
                        natalLagna={getDivisionalData(chartData, "D9")?.lagna || null}
                        transitLagna={showTransit ? (getDivisionalData(transitData, "D9")?.lagna || null) : null}
                        natalHouses={getDivisionalData(chartData, "D9")?.houses || null}
                        transitHouses={showTransit ? (getDivisionalData(transitData, "D9")?.houses || null) : null}
                        enabledAspects={enabled} 
                        selectedPlanet={selectedPlanet}
                        onSelectPlanet={onSelectPlanet}
                     />
                   </div>
                </div>

                {/* D3 */}
                <div className="flex flex-col items-center group">
                   <div className="mb-2 flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">ตรียางศ์จักร (Drekkana - D3)</span>
                   </div>
                   <div className="aspect-square h-[280px] w-[280px]">
                     <ZodiacWheel 
                        planets={getDivisionalData(chartData, "D3")?.planets || null} 
                        transitPlanets={showTransit ? (getDivisionalData(transitData, "D3")?.planets || null) : null}
                        natalLagna={getDivisionalData(chartData, "D3")?.lagna || null}
                        transitLagna={showTransit ? (getDivisionalData(transitData, "D3")?.lagna || null) : null}
                        natalHouses={getDivisionalData(chartData, "D3")?.houses || null}
                        transitHouses={showTransit ? (getDivisionalData(transitData, "D3")?.houses || null) : null}
                        enabledAspects={enabled} 
                        selectedPlanet={selectedPlanet}
                        onSelectPlanet={onSelectPlanet}
                     />
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="aspect-square h-full max-h-[calc(100vh-220px)] w-auto">
            <ZodiacWheel 
              planets={displayChartData?.planets || null} 
              transitPlanets={mode === "Synastry" ? (compareData?.person_b_chart.planets || null) : (showTransit ? (displayTransitData?.planets || null) : null)}
              natalLagna={displayChartData?.lagna || null}
              transitLagna={mode === "Synastry" ? (compareData?.person_b_chart.lagna || null) : (showTransit ? (displayTransitData?.lagna || null) : null)}
              natalHouses={displayChartData?.houses || null}
              transitHouses={mode === "Synastry" ? (compareData?.person_b_chart.houses || null) : (showTransit ? (displayTransitData?.houses || null) : null)}
              enabledAspects={enabled} 
              selectedPlanet={selectedPlanet}
              onSelectPlanet={onSelectPlanet}
              isSynastry={mode === "Synastry"}
            />
          </div>
        </div>
      )}

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
                        onAgeChange(v + (age % 1));
                    }}
                    className="w-10 bg-primary/10 border border-primary/30 rounded px-1 py-0.5 text-center text-primary font-bold"
                />
                <span className="text-muted-foreground">ปี</span>
                <span className="text-primary font-bold ml-1">{Math.floor((age % 1) * 12)}</span>
                <span className="text-muted-foreground">ด.</span>
            </div>
            <span className="mx-2 text-border">|</span>
            <span className="text-muted-foreground">วันที่: </span>
            <div className="flex gap-1 items-center bg-primary/10 border border-primary/30 rounded px-1 py-0.5">
              <input 
                type="text" 
                value={tDay}
                onFocus={() => setIsEditingDate(true)}
                onChange={(e) => setTDay(e.target.value)}
                onBlur={handleDateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDateSubmit(); }}
                placeholder="วว"
                className="bg-transparent text-primary font-bold text-center w-6 outline-none"
              />
              <span className="text-primary/50">/</span>
              <input 
                type="text" 
                value={tMonth}
                onFocus={() => setIsEditingDate(true)}
                onChange={(e) => setTMonth(e.target.value)}
                onBlur={handleDateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDateSubmit(); }}
                placeholder="ดด"
                className="bg-transparent text-primary font-bold text-center w-6 outline-none"
              />
              <span className="text-primary/50">/</span>
              <input 
                type="text" 
                value={tYear}
                onFocus={() => setIsEditingDate(true)}
                onChange={(e) => setTYear(e.target.value)}
                onBlur={handleDateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDateSubmit(); }}
                placeholder="ปปปป"
                className="bg-transparent text-primary font-bold text-center w-10 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            <button 
                onClick={() => { const v = age + (1/365.25); setAge(v); onAgeChange(v); }}
                className="rounded border border-border px-1.5 py-0.5 hover:text-foreground hover:bg-muted"
            >+1 วัน</button>
            <button 
                onClick={() => { const v = age + (1/12); setAge(v); onAgeChange(v); }}
                className="rounded border border-border px-1.5 py-0.5 hover:text-foreground hover:bg-muted"
            >+1 ด.</button>
            <button 
                onClick={() => { const v = age + 1; setAge(v); onAgeChange(v); }}
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
            onAgeChange(v);
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