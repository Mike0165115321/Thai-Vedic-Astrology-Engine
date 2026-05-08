"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Filter, Clock, ChevronLeft, ChevronRight, Plus, Minus, RefreshCw } from "lucide-react";
import { ZodiacWheel } from "./ZodiacWheel";
import { motion } from "framer-motion";
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
  synastryFocus: "A" | "B" | "Both";
  setSynastryFocus: (f: "A" | "B" | "Both") => void;
};

const planetThaiNames: { [key: string]: string } = {
    Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
    Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ"
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
  getDivisionalData,
  synastryFocus,
  setSynastryFocus
}: Props) {
  const [age, setAge] = useState(0);
  const [timelineScale, setTimelineScale] = useState<30 | 60 | 90 | 120>(120);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [showTransit, setShowTransit] = useState(true);
  const [enabled, setEnabled] = useState<string[]>(ASPECTS.map((a) => a.type));
  const [tDay, setTDay] = useState("");
  const [tMonth, setTMonth] = useState("");
  const [tYear, setTYear] = useState("");
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

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
      <div className="relative flex-1 flex flex-col overflow-hidden custom-scrollbar bg-black/20">
        {/* Zoom Controls (More subtle, bottom-right) */}
        <div className="absolute bottom-8 right-6 z-50 flex flex-col items-center gap-2 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/5 p-1.5 rounded-full transition-all shadow-xl group/zoom">
            <button 
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white/50 group-hover/zoom:text-white transition-colors"
                title="ซูมเข้า"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="h-10 w-0.5 bg-white/10 rounded-full relative overflow-hidden">
                <motion.div 
                    className="absolute bottom-0 left-0 w-full bg-primary/40 group-hover/zoom:bg-primary/80"
                    animate={{ height: `${((zoomLevel - 1) / 2) * 100}%` }}
                />
            </div>
            <button 
                onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white/50 group-hover/zoom:text-white transition-colors"
                title="ซูมออก"
            >
                <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
                onClick={() => setZoomLevel(1)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary/50 group-hover/zoom:text-primary transition-colors mt-0.5"
                title="รีเซ็ต"
            >
                <RefreshCw className="w-3 h-3" />
            </button>
        </div>

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

             <div className="flex flex-wrap justify-center gap-10">
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
          <>
          <div 
            className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-4 overflow-hidden"
            onWheel={(e) => {
                if (e.deltaY < 0) {
                    setZoomLevel(prev => Math.min(3, prev + 0.2));
                } else {
                    setZoomLevel(prev => Math.max(1, prev - 0.2));
                }
            }}
          >
            <motion.div 
                className={`aspect-square w-full h-full max-w-full max-h-full flex items-center justify-center transition-shadow ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                animate={{ scale: zoomLevel }}
                drag={zoomLevel > 1}
                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                dragElastic={0.1}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
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
              synastryFocus={synastryFocus}
            />
          </motion.div>
        </div>
          
          {/* Synastry Focus Toggle (Moved left to avoid zoom controls) */}
          {mode === "Synastry" && (
            <div className="absolute bottom-8 right-20 flex bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl z-20">
                {[
                  { id: "A", label: "คนที่ 1", color: "bg-[#3b82f6] text-white" },
                  { id: "B", label: "คนที่ 2", color: "bg-white text-slate-900" },
                  { id: "Both", label: "ดูพร้อมกัน", color: "bg-primary text-slate-900" }
                ].map(f => (
                 <button
                   key={f.id}
                   onClick={() => setSynastryFocus(f.id as any)}
                   className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                     synastryFocus === f.id ? `${f.color} shadow-lg scale-105` : "text-muted-foreground hover:text-foreground"
                   }`}
                 >
                   {f.label}
                 </button>
               ))}
            </div>
          )}

        {chartData && (
          <>
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-border bg-card/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur z-20">
              วันกำเนิด · {chartData.julian_date.toFixed(4)}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 rounded border border-border bg-card/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur z-20">
              ลัคนา · {chartData.lagna.longitude.toFixed(2)}°
            </div>
          </>
        )}
        </>
      )}

      {/* Transit Controls (Back at the corner with HIGH visibility) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-40">
           <button
              onClick={() => setShowTransit(!showTransit)}
              className={`flex h-8 items-center gap-2 rounded-full border px-4 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl ${
                showTransit ? "border-primary bg-primary text-black font-black" : "border-white/20 bg-black/60 text-white hover:bg-black/80"
              }`}
           >
              <span className={`h-2 w-2 rounded-full ${showTransit ? "bg-black animate-pulse" : "bg-white/40"}`} />
              <span className="text-[11px] font-black uppercase tracking-wider">แสดงดาวจร</span>
           </button>
  
           {showTransit && (
             <button
                onClick={() => {
                  if (!chartData) return;
                  const now = new Date();
                  const birthMs = chartData.julian_date * 86400000 - 210866803200000;
                  const diffDays = (now.getTime() - birthMs) / (1000 * 3600 * 24);
                  const newAge = Math.max(0, diffDays / 365.2422);
                  setAge(newAge);
                  onAgeChange(newAge);
                }}
                className="flex h-8 items-center gap-2 rounded-full border border-primary/50 bg-black/90 px-4 text-primary hover:bg-primary hover:text-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
             >
                <Clock className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-wider">ดาวจรปัจจุบัน</span>
             </button>
           )}
      </div>
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
            
            <span className="mx-2 text-border">|</span>

            <span className="mx-2 text-border">|</span>
            
            {/* Scale Selector */}
            
            {/* Scale Selector - Moved Here */}
            <span className="mx-2 text-border">|</span>
            <div className="flex gap-1 items-center bg-black/20 rounded-lg p-0.5 border border-white/5">
                {timelineScale < 120 && (
                   <button 
                     onClick={() => {
                        const nextOffset = Math.max(0, timelineOffset - timelineScale);
                        setTimelineOffset(nextOffset);
                        setAge(nextOffset);
                        onAgeChange(nextOffset);
                     }}
                     className="px-1.5 py-0.5 text-muted-foreground hover:text-primary transition-colors"
                   >
                     <ChevronLeft className="h-3 w-3" />
                   </button>
                )}
                {[30, 60, 90, 120].map((s) => (
                    <button
                        key={s}
                        onClick={() => {
                          setTimelineScale(s as any);
                          setTimelineOffset(Math.floor(age / s) * s);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${
                        timelineScale === s 
                        ? "bg-primary text-black shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                    >
                        {s === 120 ? "ทั้งหมด" : `${s} ปี`}
                    </button>
                ))}
                {timelineScale < 120 && (
                   <button 
                     onClick={() => {
                        const nextOffset = Math.min(120 - timelineScale, timelineOffset + timelineScale);
                        setTimelineOffset(nextOffset);
                        setAge(nextOffset);
                        onAgeChange(nextOffset);
                     }}
                     className="px-1.5 py-0.5 text-muted-foreground hover:text-primary transition-colors"
                   >
                     <ChevronRight className="h-3 w-3" />
                   </button>
                )}
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
        {/* Dasha Scrubber Integration with Zoom */}
        {chartData?.dasha_timeline && (
          <div className="relative mb-6">
             <div className="flex justify-end mb-1">
                {/* Antardasha Micro-indicator */}
                {(() => {
                    const tl = chartData.dasha_timeline;
                    const firstStart = new Date(tl[0].start).getTime();
                    const targetMs = firstStart + (age * 31556926000);
                    const currentM = tl.find(d => targetMs >= new Date(d.start).getTime() && targetMs < new Date(d.end).getTime()) || tl[0];
                    if (!currentM || !currentM.antardashas) return null;
                    const currentA = currentM.antardashas.find(a => targetMs >= new Date(a.start).getTime() && targetMs < new Date(a.end).getTime());
                    if (!currentA) return null;
                    
                    return (
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                {planetThaiNames[currentM.planet]} / {planetThaiNames[currentA.planet]}
                            </span>
                        </div>
                    );
                })()}
             </div>

             {/* The Bar */}
             <div className="relative h-4 w-full rounded-full overflow-hidden border border-white/5 bg-black/40 shadow-inner group">
                {(() => {
                    const tl = chartData.dasha_timeline;
                    const firstStart = new Date(tl[0].start).getTime();
                    
                    // Window Logic
                    const windowStartAge = timelineOffset;
                    const windowEndAge = Math.min(120, timelineOffset + timelineScale);
                    
                    const windowStartMs = firstStart + (windowStartAge * 31556926000);
                    const windowEndMs = firstStart + (windowEndAge * 31556926000);
                    const windowDuration = windowEndMs - windowStartMs;

                    return tl.map((d) => {
                        const start = new Date(d.start).getTime();
                        const end = new Date(d.end).getTime();
                        
                        // Crop to window
                        const displayStart = Math.max(start, windowStartMs);
                        const displayEnd = Math.min(end, windowEndMs);
                        
                        if (displayStart >= displayEnd) return null;

                        const width = ((displayEnd - displayStart) / windowDuration) * 100;
                        const left = ((displayStart - windowStartMs) / windowDuration) * 100;

                        const colors: any = { 
                          Sun: "#FBBF24",     // Golden Yellow
                          Moon: "#F8FAFC",    // Bright White
                          Mars: "#F87171",    // Soft Red
                          Mercury: "#34D399", // Emerald Green
                          Jupiter: "#A78BFA", // Bright Purple
                          Venus: "#F472B6",   // Vibrant Pink
                          Saturn: "#94A3B8",  // Slate Blue (Lighter)
                          Rahu: "#6366F1",    // Indigo (More visible)
                          Ketu: "#FCD34D"     // Amber
                        };
                        const nums: any = { Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔", Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘", Ketu: "๙" };
                        
                        const targetMs = firstStart + (age * 31556926000); 
                        const isActive = targetMs >= start && targetMs < end;

                        return (
                            <div key={d.planet + d.start}
                                className={`absolute top-0 h-full flex items-center justify-center border-r border-black/10 text-[10px] font-black text-white drop-shadow-md transition-all ${isActive ? "opacity-100 ring-2 ring-white/70 z-10 scale-y-125" : "opacity-40"}`}
                                style={{ left: `${left}%`, width: `${width}%`, background: colors[d.planet] }}
                            >
                                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{nums[d.planet]}</span>
                            </div>
                        );
                    });
                })()}
             </div>
          </div>
        )}

        <input
          type="range"
          min={timelineOffset}
          max={Math.min(120, timelineOffset + timelineScale)}
          step="0.0001"
          value={age}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setAge(v);
            onAgeChange(v);
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary transition-all hover:bg-muted focus:outline-none"
        />
        <div className="mt-2 flex justify-between px-1 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          {(() => {
             const windowStartAge = timelineOffset;
             const birthYear = chartData?.dasha_timeline ? new Date(chartData.dasha_timeline[0].start).getFullYear() + 543 : 2549;
             
             return [0, 1, 2, 3, 4].map(i => {
                const markerAge = windowStartAge + (i * (timelineScale / 4));
                if (markerAge > 120) return null;
                return (
                    <div key={i} className={`flex flex-col ${i === 0 ? "items-start" : i === 4 ? "items-end" : "items-center"}`}>
                        <span>{markerAge} ปี</span>
                        <span className="text-[7px] opacity-60">พ.ศ. {birthYear + Math.floor(markerAge)}</span>
                    </div>
                );
             });
          })()}
        </div>
      </div>
    </section>
  );
}