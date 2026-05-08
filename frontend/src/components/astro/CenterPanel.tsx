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
  const [showBottomPanel, setShowBottomPanel] = useState(true);

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
      const targetDate = new Date(year, month - 1, day, 12, 0);
      const targetMs = targetDate.getTime();
      const birthMs = chartData.julian_date * 86400000 - 210866803200000;
      const diffDays = (targetMs - birthMs) / (1000 * 3600 * 24);
      const newAge = Math.max(0, diffDays / 365.2422);
      setAge(newAge);
      onAgeChange(newAge);
    }
  };

  const toggle = (t: string) =>
    setEnabled((e) => (e.includes(t) ? e.filter((x) => x !== t) : [...e, t]));

  return (
    <section className="flex flex-col h-full bg-(image:--gradient-cosmic) relative overflow-hidden font-sans">
      {/* ส่วนควบคุมมุมสัมพันธ์ */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card/60 px-5 py-2.5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-foreground">มุมสัมพันธ์</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ASPECTS.map((a) => {
            const on = enabled.includes(a.type);
            const thaiAspects: any = { Conjunction: "กุม", Opposition: "เล็ง", Trine: "ตรีโกณ", Square: "จตุโกณ", Sextile: "โยค" };
            return (
              <button
                key={a.type}
                onClick={() => toggle(a.type)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 transition-all duration-300 text-[11px] font-bold ${
                  on ? "border-primary/50 bg-primary/10 text-primary shadow-sm" : "border-border bg-transparent text-muted-foreground/40"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.color, opacity: on ? 1 : 0.3 }} />
                <span className="opacity-80">{a.angle}°</span>
                <span className="hidden lg:inline">{thaiAspects[a.type] || a.type}</span>
              </button>
            );
          })}
        </div>
        <div className="hidden text-[10px] font-medium text-muted-foreground/60 md:block tracking-wide">
          ระยะเอื้อม ≤ 5°  ·  ระบบนิรายนะ  ·  อายนางศ: ลาหิรี
        </div>
      </div>

      {/* พื้นที่แสดงจักรราศี */}
      <div className="relative flex-1 flex flex-col overflow-hidden bg-black/30">
        
        {/* ส่วนควบคุมการซูม */}
        <div className="absolute bottom-10 right-8 z-50 flex flex-col items-center gap-3 bg-card/60 backdrop-blur-xl border border-border p-2 rounded-full shadow-2xl transition-all group/zoom">
            <button 
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                disabled={zoomLevel >= 3}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${zoomLevel >= 3 ? "bg-white/5 text-white/10 cursor-not-allowed" : "bg-primary/10 hover:bg-primary text-primary hover:text-black"}`}
                title="ขยาย"
            >
                <Plus className="w-4 h-4" />
            </button>
            <div className="h-12 w-1 bg-border rounded-full relative overflow-hidden">
                <motion.div 
                    className="absolute bottom-0 left-0 w-full bg-primary"
                    animate={{ height: `${((zoomLevel - 1) / 2) * 100}%` }}
                />
            </div>
            <button 
                onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                disabled={zoomLevel <= 1}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${zoomLevel <= 1 ? "bg-white/5 text-white/10 cursor-not-allowed" : "bg-primary/10 hover:bg-primary text-primary hover:text-black"}`}
                title="ย่อ"
            >
                <Minus className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setZoomLevel(1)}
                disabled={zoomLevel <= 1}
                className={`w-9 h-9 flex items-center justify-center rounded-full mt-1 transition-all ${zoomLevel <= 1 ? "bg-white/5 text-primary/20" : "bg-white/10 hover:bg-white/20 text-primary"}`}
                title="รีเซ็ต"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>

        {chartType === "CAL" ? (
          <div 
            className="relative flex-1 w-full h-full min-h-0 overflow-hidden"
            onWheel={(e) => {
                if (e.deltaY < 0) setZoomLevel(prev => Math.min(3, prev + 0.1));
                else setZoomLevel(prev => Math.max(1, prev - 0.1));
            }}
          >
            <motion.div 
              className={`w-full h-full flex flex-col items-center justify-center ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
              animate={zoomLevel === 1 ? { scale: 1, x: 0, y: 0 } : { scale: zoomLevel }}
              drag={zoomLevel > 1}
              dragConstraints={{ left: -800, right: 800, top: -800, bottom: 800 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="grid grid-cols-1 gap-16 w-full max-w-6xl mx-auto py-12 px-6">
                 {/* ราศีจักร (D1) */}
                 <div className="flex flex-col items-center">
                    <div className="mb-4 flex items-center gap-3 rounded-full border border-primary/40 bg-primary/10 px-5 py-1.5 backdrop-blur-md shadow-lg shadow-primary/10">
                       <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
                       <span className="text-[12px] font-black uppercase tracking-[0.2em] text-primary">ราศีจักร (พื้นดวงหลัก)</span>
                    </div>
                    <div className="aspect-square h-[450px] w-[450px]">
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

                 <div className="flex flex-wrap justify-center gap-14">
                    {/* นวางศ์จักร (D9) */}
                    <div className="flex flex-col items-center group">
                       <div className="mb-3 flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-4 py-1 transition-all group-hover:border-primary/40 group-hover:bg-primary/5">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">นวางศ์จักร (ไส้ในดวง)</span>
                       </div>
                       <div className="aspect-square h-[300px] w-[300px]">
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

                    {/* ตรียางศ์จักร (D3) */}
                    <div className="flex flex-col items-center group">
                       <div className="mb-3 flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-4 py-1 transition-all group-hover:border-primary/40 group-hover:bg-primary/5">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">ตรียางศ์จักร (พี่น้อง/ลาภผล)</span>
                       </div>
                       <div className="aspect-square h-[300px] w-[300px]">
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
            </motion.div>
          </div>

        ) : (
          <>
          <div 
            className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-6 overflow-hidden"
            onWheel={(e) => {
                if (e.deltaY < 0) setZoomLevel(prev => Math.min(3, prev + 0.1));
                else setZoomLevel(prev => Math.max(1, prev - 0.1));
            }}
          >
            <motion.div 
                className={`aspect-square w-full h-full max-w-full max-h-full flex items-center justify-center ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                animate={zoomLevel === 1 ? { scale: 1, x: 0, y: 0 } : { scale: zoomLevel }}
                drag={zoomLevel > 1}
                dragConstraints={{ left: -800, right: 800, top: -800, bottom: 800 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
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
          
          {/* ตัวเลือกการเน้นดวงสมพงษ์ */}
          {mode === "Synastry" && (
            <div className="absolute bottom-10 right-24 flex bg-black/60 backdrop-blur-2xl border border-border rounded-full p-1.5 shadow-2xl z-20">
                {[
                  { id: "A", label: "คนที่ 1", color: "bg-blue-500 text-white shadow-blue-500/40" },
                  { id: "B", label: "คนที่ 2", color: "bg-pink-500 text-white shadow-pink-500/40" },
                  { id: "Both", label: "ดูทั้งคู่", color: "bg-primary text-black shadow-primary/40" }
                ].map(f => (
                 <button
                   key={f.id}
                   onClick={() => setSynastryFocus(f.id as any)}
                   className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all duration-300 ${
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
            <div className="pointer-events-none absolute left-5 top-5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-[11px] font-bold text-muted-foreground backdrop-blur-md z-20 shadow-lg">
              จูเลียนดีต (JD) · {chartData.julian_date.toFixed(4)}
            </div>
            <div className="pointer-events-none absolute right-5 top-5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-[11px] font-bold text-muted-foreground backdrop-blur-md z-20 shadow-lg">
              ลัคนาสะสม · {chartData.lagna.longitude.toFixed(2)}°
            </div>
          </>
        )}
        </>
      )}

      {/* ส่วนควบคุมดาวจร (ปุ่มหลัก) */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 z-40">
           <button
              onClick={() => setShowTransit(!showTransit)}
              className={`flex h-10 items-center gap-3 rounded-full border px-5 transition-all shadow-2xl backdrop-blur-xl ${
                showTransit ? "border-primary bg-primary text-black font-black" : "border-border bg-black/60 text-white hover:bg-black/80"
              }`}
           >
              <span className={`h-2.5 w-2.5 rounded-full ${showTransit ? "bg-black animate-pulse shadow-glow" : "bg-white/20"}`} />
              <span className="text-[12px] font-black uppercase tracking-widest">แสดงตำแหน่งดาวจร</span>
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
                className="flex h-10 items-center gap-2.5 rounded-full border border-primary/40 bg-black/80 px-5 text-primary hover:bg-primary hover:text-black transition-all shadow-2xl backdrop-blur-xl group"
             >
                <Clock className="h-4.5 w-4.5 transition-transform group-hover:rotate-12" />
                <span className="text-[12px] font-black uppercase tracking-widest">ดาวจรปัจจุบัน</span>
             </button>
           )}
      </div>
      </div>

      {/* ปุ่มเปิด-ปิดแถบเวลาด้านล่าง */}
      <div className="relative z-50 flex justify-center w-full h-0">
          <button
            onClick={() => setShowBottomPanel(!showBottomPanel)}
            className="absolute bottom-0 flex h-6 w-16 items-center justify-center rounded-t-xl border border-b-0 border-border bg-card/90 text-primary hover:bg-primary hover:text-black transition-all shadow-2xl backdrop-blur-lg"
          >
            {showBottomPanel ? <span className="text-[12px]">▼</span> : <span className="text-[12px]">▲</span>}
          </button>
      </div>

      {/* แถบควบคุมเวลาและอายุ (Scrubber) */}
      <div 
        className="grid transition-all duration-700 ease-in-out border-t border-border bg-card/80 backdrop-blur-xl"
        style={{ gridTemplateRows: showBottomPanel ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs text-foreground flex items-center gap-3">
            <span className="text-muted-foreground font-bold uppercase tracking-[0.15em] text-[10px]">อายุชะตา:</span>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    value={Math.floor(age)} 
                    onChange={(e) => {
                        const v = Math.max(0, Math.min(120, parseFloat(e.target.value) || 0));
                        setAge(v + (age % 1));
                        onAgeChange(v + (age % 1));
                    }}
                    className="w-12 bg-primary/10 border border-primary/30 rounded-lg px-2 py-1 text-center text-primary font-black shadow-inner"
                />
                <span className="text-muted-foreground font-bold">ปี</span>
                <span className="text-primary font-black ml-1.5 text-lg">{Math.floor((age % 1) * 12)}</span>
                <span className="text-muted-foreground font-bold">เดือน</span>
            </div>
            <span className="mx-3 text-border/30">|</span>
            <span className="text-muted-foreground font-bold uppercase tracking-[0.15em] text-[10px]">วันที่ดาวจร:</span>
            <div className="flex gap-1.5 items-center bg-primary/5 border border-primary/20 rounded-lg px-3 py-1 shadow-inner">
              <input 
                type="text" 
                value={tDay}
                onFocus={() => setIsEditingDate(true)}
                onChange={(e) => setTDay(e.target.value)}
                onBlur={handleDateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDateSubmit(); }}
                className="bg-transparent text-primary font-black text-center w-7 outline-none"
              />
              <span className="text-primary/30">/</span>
              <input 
                type="text" 
                value={tMonth}
                onFocus={() => setIsEditingDate(true)}
                onChange={(e) => setTMonth(e.target.value)}
                onBlur={handleDateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDateSubmit(); }}
                className="bg-transparent text-primary font-black text-center w-7 outline-none"
              />
              <span className="text-primary/30">/</span>
              <input 
                type="text" 
                value={tYear}
                onFocus={() => setIsEditingDate(true)}
                onChange={(e) => setTYear(e.target.value)}
                onBlur={handleDateSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDateSubmit(); }}
                className="bg-transparent text-primary font-black text-center w-12 outline-none"
              />
            </div>
            
            <button 
              onClick={() => {
                if (!chartData) return;
                const now = new Date();
                const birth = new Date(chartData.julian_date * 86400000 - 210866803200000);
                const diffDays = (now.getTime() - birth.getTime()) / (1000 * 3600 * 24);
                const currentAge = diffDays / 365.2422;
                setAge(currentAge);
                onAgeChange(currentAge);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black font-black hover:brightness-110 transition-all text-[11px] shadow-lg shadow-primary/20 ml-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              ปัจจุบัน
            </button>
            
            <div className="flex gap-1.5 items-center bg-black/30 rounded-xl p-1 border border-border ml-4 shadow-inner">
                {timelineScale < 120 && (
                   <button 
                     onClick={() => {
                        const nextOffset = Math.max(0, timelineOffset - timelineScale);
                        setTimelineOffset(nextOffset);
                        setAge(nextOffset);
                        onAgeChange(nextOffset);
                     }}
                     className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
                   >
                     <ChevronLeft className="h-4 w-4" />
                   </button>
                )}
                {[30, 60, 90, 120].map((s) => (
                    <button
                        key={s}
                        onClick={() => {
                          setTimelineScale(s as any);
                          setTimelineOffset(Math.floor(age / s) * s);
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all duration-300 ${
                        timelineScale === s 
                        ? "bg-white/10 text-primary shadow-glow border border-primary/30" 
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
                     className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
                   >
                     <ChevronRight className="h-4 w-4" />
                   </button>
                )}
            </div>
          </div>

          <div className="flex gap-1.5">
            {[
                { label: "+1 วัน", val: 1/365.25 },
                { label: "+1 เดือน", val: 1/12 },
                { label: "+1 ปี", val: 1 }
            ].map(b => (
                <button 
                    key={b.label}
                    onClick={() => { const v = age + b.val; setAge(v); onAgeChange(v); }}
                    className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95"
                >{b.label}</button>
            ))}
          </div>
        </div>

        {/* แถบดวงวัย (Dasha) */}
        {chartData?.dasha_timeline && (
          <div className="relative mb-8">
             <div className="flex justify-end mb-1.5">
                {(() => {
                    const tl = chartData.dasha_timeline;
                    const firstStart = new Date(tl[0].start).getTime();
                    const targetMs = firstStart + (age * 31556926000);
                    const currentM = tl.find(d => targetMs >= new Date(d.start).getTime() && targetMs < new Date(d.end).getTime()) || tl[0];
                    if (!currentM || !currentM.antardashas) return null;
                    const currentA = currentM.antardashas.find(a => targetMs >= new Date(a.start).getTime() && targetMs < new Date(a.end).getTime());
                    if (!currentA) return null;
                    
                    return (
                        <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 shadow-lg shadow-primary/5">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                มหาทศา: {planetThaiNames[currentM.planet]}  /  อนุทศา: {planetThaiNames[currentA.planet]}
                            </span>
                        </div>
                    );
                })()}
             </div>

             <div className="relative h-5 w-full rounded-full overflow-hidden border border-white/10 bg-black/60 shadow-2xl group">
                {(() => {
                    const tl = chartData.dasha_timeline;
                    const firstStart = new Date(tl[0].start).getTime();
                    const windowStartAge = timelineOffset;
                    const windowEndAge = Math.min(120, timelineOffset + timelineScale);
                    const windowStartMs = firstStart + (windowStartAge * 31556926000);
                    const windowEndMs = firstStart + (windowEndAge * 31556926000);
                    const windowDuration = windowEndMs - windowStartMs;

                    return tl.map((d) => {
                        const start = new Date(d.start).getTime();
                        const end = new Date(d.end).getTime();
                        const displayStart = Math.max(start, windowStartMs);
                        const displayEnd = Math.min(end, windowEndMs);
                        if (displayStart >= displayEnd) return null;

                        const width = ((displayEnd - displayStart) / windowDuration) * 100;
                        const left = ((displayStart - windowStartMs) / windowDuration) * 100;

                        const colors: any = { 
                          Sun: "#FBBF24", Moon: "#F8FAFC", Mars: "#F87171", Mercury: "#34D399",
                          Jupiter: "#A78BFA", Venus: "#F472B6", Saturn: "#94A3B8", Rahu: "#6366F1", Ketu: "#FCD34D"
                        };
                        const nums: any = { Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔", Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘", Ketu: "๙" };
                        
                        const targetMs = firstStart + (age * 31556926000); 
                        const isActive = targetMs >= start && targetMs < end;

                        return (
                            <div key={d.planet + d.start}
                                className={`absolute top-0 h-full flex items-center justify-center border-r border-black/20 text-[11px] font-black text-white transition-all duration-500 ${isActive ? "opacity-100 ring-2 ring-white/80 z-10 scale-y-125 shadow-glow" : "opacity-30"}`}
                                style={{ left: `${left}%`, width: `${width}%`, background: colors[d.planet] }}
                            >
                                <span className="drop-shadow-lg">{nums[d.planet]}</span>
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
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border/40 accent-primary transition-all hover:bg-border/60 focus:outline-none"
        />
        <div className="mt-3 flex justify-between px-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
          {(() => {
             const windowStartAge = timelineOffset;
             const birthYear = chartData?.dasha_timeline ? new Date(chartData.dasha_timeline[0].start).getFullYear() + 543 : 2549;
             
             return [0, 1, 2, 3, 4].map(i => {
                const markerAge = windowStartAge + (i * (timelineScale / 4));
                if (markerAge > 120) return null;
                return (
                    <div key={i} className={`flex flex-col gap-1 ${i === 0 ? "items-start" : i === 4 ? "items-end" : "items-center"}`}>
                        <span className="text-muted-foreground/60">{markerAge} ปี</span>
                        <span className="text-[9px] opacity-40 font-medium">พ.ศ. {birthYear + Math.floor(markerAge)}</span>
                    </div>
                );
             });
          })()}
        </div>
        </div>
      </div>
    </section>
  );
}