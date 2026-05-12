"use client";

import { useState, useMemo } from "react";
import { SIGNS } from "./data";
import { ChartData, CompareResponse } from "@/types/chart";
import { THAI_NAKSHATRAS } from "./nakshatra_data";

type Tab = "ข้อมูลดาว" | "ตารางดาว" | "การทำมุม";

function degToSign(lon: number) {
  const i = Math.floor(lon / 30);
  const deg = lon - i * 30;
  const m = Math.floor((deg - Math.floor(deg)) * 60);
  return { sign: SIGNS[i], deg: Math.floor(deg), min: m };
}

type Props = {
  chartData: ChartData | null;
  transitData: ChartData | null;
  compareData?: CompareResponse | null;
  displayCompareDataB: ChartData | null;
  mode?: "Natal" | "Synastry" | "Transit";
  chartType: "D1" | "D3" | "D9" | "CAL";
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
  onAgeChange: (age: number) => void;
};

const HOUSE_NAMES_TH = [
    "ตนุ", "กดุมภะ", "สหัชชะ", "พันธุ", "ปุตตะ", "อริ", 
    "ปัตนิ", "มรณะ", "ศุภะ", "กัมมะ", "ลาภะ", "วินาศ"
];

const ASPECT_LABELS: { [key: number]: { label: string; color: string; desc: string } } = {
  0: { label: "กุม", color: "#fbbf24", desc: "รวมพลังงานเป็นหนึ่งเดียว" },
  30: { label: "กึ่งมิตร", color: "#818cf8", desc: "เกื้อกูลกันแบบห่างๆ" },
  60: { label: "โยค", color: "#22d3ee", desc: "ส่งเสริม โอกาสที่ดี" },
  90: { label: "ฉาก", color: "#fb7185", desc: "ขัดแย้ง ท้าทาย ต้องฝ่าฟัน" },
  120: { label: "ตรีโกณ", color: "#34d399", desc: "ราบรื่น โชคลาภ เกื้อหนุน" },
  150: { label: "กึ่งศัตรู", color: "#a855f7", desc: "ปรับตัวเข้ากันยาก" },
  180: { label: "เล็ง", color: "#f87171", desc: "เผชิญหน้า สมดุล หรือแตกหัก" }
};

const planetThaiNames: { [key: string]: string } = {
    Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
    Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ", Uranus: "มฤตยู"
};

const planetColors: { [key: string]: string } = {
    Sun: "var(--warning)", Moon: "#cfd6e4", Mars: "var(--destructive)",
    Jupiter: "var(--primary)", Venus: "#f5b8e0", Mercury: "var(--info)",
    Saturn: "#94a3b8", Rahu: "#f59e0b", Ketu: "#fbbf24", Uranus: "#a78bfa"
};

const getThaiNak = (index: number) => {
    return THAI_NAKSHATRAS.find(n => n.id === index);
};

const getDignityStyle = (dignity: string) => {
    if (dignity.includes("มหาอุจจ์")) return "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30";
    if (dignity.includes("อุจจ์")) return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    if (dignity.includes("เกษตร")) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (dignity.includes("มหาจักร")) return "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30";
    if (dignity.includes("ราชาโชค") || dignity.includes("เทวีโชค")) return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    if (dignity.includes("วรโคตม")) return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
    if (dignity.includes("พักร์") || dignity.includes("ดับ")) return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
    if (dignity.includes("ประ") || dignity.includes("นิจ")) return "bg-red-500/10 text-red-400/80 border border-red-500/20";
    return "bg-slate-700/50 text-slate-300 border border-slate-600/50";
};

// Helper function to extract and format planets for rendering
function processChartPlanets(cData: any, ownerTag: string | null = null, ownerColor: string | null = null) {
    if (!cData || !cData.planets) return [];
    const res = [];
    
    // Process Lagna
    if (cData.lagna) {
        const n = cData.lunar_data?.lagna_nakshatra;
        const t = n ? getThaiNak(n.index) : null;
        res.push({
            isLagna: true,
            nameInEng: "Lagna",
            name: "ลัคนา",
            symbol: "ลั",
            color: "var(--warning)",
            lon: cData.lagna.longitude,
            nakshatra: t ? `${t.name} (${n.pada})` : "—",
            house: 1,
            dignityList: [],
            retro: false,
            ownerTag,
            ownerColor,
            cData
        });
    }
    
    // Process Planets
    Object.entries(cData.planets).forEach(([name, p]: [string, any]) => {
        const naks = cData.lunar_data?.planet_nakshatras?.[name];
        const t = naks ? getThaiNak(naks.index) : null;
        
        let rawList = Array.isArray(p.dignity_list) ? p.dignity_list : (p.dignity ? [p.dignity] : []);
        if (rawList.length > 1 && rawList.every((s: any) => typeof s === 'string' && s.length === 1)) {
            rawList = [rawList.join('')];
        }
        let allStatuses = [...rawList];
        if (p.is_retrograde && !allStatuses.includes("พักร์")) allStatuses.push("พักร์");
        if (p.is_combust && !allStatuses.includes("ดับ")) allStatuses.push("ดับ");
        if (p.speed_status && p.speed_status !== "Normal" && !allStatuses.includes(p.speed_status)) {
            const thaiSpeed: any = { "Slow (ช้า)": "มนทร์", "Fast (เร็ว)": "เสริด", "Stationary (หยุด)": "เสริด" };
            if (thaiSpeed[p.speed_status]) allStatuses.push(thaiSpeed[p.speed_status]);
        }
        const isNormal = (s: string) => s.trim() === "ปกติ" || s.includes("ปกติ");
        if (allStatuses.length > 1 && allStatuses.some(isNormal)) {
            allStatuses = allStatuses.filter(s => !isNormal(s));
        }
        
        res.push({
            isLagna: false,
            nameInEng: name,
            name: planetThaiNames[name] || name,
            symbol: p.symbol || name.substring(0, 2),
            color: planetColors[name] || "var(--accent)",
            lon: p.longitude,
            retro: p.is_retrograde,
            house: p.house,
            dignityList: allStatuses,
            nakshatra: t ? `${t.name} (${naks.pada})` : "—",
            ownerTag,
            ownerColor,
            cData
        });
    });
    return res;
}

export function RightPanel({ chartData: natalData, transitData, compareData, displayCompareDataB, mode, chartType, selectedPlanet, onSelectPlanet }: Props) {
  const [tab, setTab] = useState<Tab>("ข้อมูลดาว");
  const [personFocus, setPersonFocus] = useState<"A" | "B" | "Both">("A");

  const chartData = useMemo(() => {
    if (mode === "Transit") return transitData;
    if (mode === "Synastry") {
      const data = personFocus === "B" ? displayCompareDataB : natalData;
      // Fallback to natalData if focusing on B but data not yet ready, to avoid blank screen
      return data || natalData;
    }
    return natalData;
  }, [mode, personFocus, natalData, transitData, compareData, displayCompareDataB]);

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card/40 overflow-hidden font-sans">
      <div className="flex flex-col gap-4 px-5 pt-5 pb-3 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-glow" />
                  {mode === "Transit" ? "ข้อมูลดาวจรปัจจุบัน" : (mode === "Synastry" ? `ข้อมูลดวงชะตา (${personFocus === "A" ? "คนแรก" : personFocus === "B" ? "คนที่สอง" : "ดวงสมพงษ์"})` : "ข้อมูลดวงชะตา")}
              </h2>
          </div>
          
          <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5 shadow-inner">
        {(["ข้อมูลดาว", "ตารางดาว", "การทำมุม"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-[11px] font-bold transition-all duration-300 rounded-lg ${
              tab === t ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}>
            {t}
          </button>
        ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-primary/10">
        {!natalData ? (
          <div className="flex h-full items-center justify-center p-10 text-center text-[11px] text-muted-foreground/40 italic font-medium tracking-widest">
            รอการคำนวณข้อมูลชะตา...
          </div>
        ) : (
          <>
            {mode === "Synastry" && (
                <div className="flex gap-2 p-3 bg-muted/20 border-b border-border/50 sticky top-0 z-10 backdrop-blur-xl">
                    {[
                        { id: "A", label: "คนที่ 1", color: "bg-blue-500 shadow-blue-500/30" },
                        { id: "B", label: "คนที่ 2", color: "bg-pink-500 shadow-pink-500/30" },
                        { id: "Both", label: "ดวงสมพงษ์", color: "bg-primary text-black shadow-primary/30" }
                    ].map(f => (
                        <button 
                            key={f.id}
                            onClick={() => setPersonFocus(f.id as any)}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                                personFocus === f.id ? `${f.color} text-white shadow-lg scale-105` : "text-muted-foreground hover:bg-white/5"
                            } ${f.id === "Both" && personFocus === "Both" ? "text-black" : ""}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            )}
            {tab === "ข้อมูลดาว" && (
              <div className="p-0 pb-12 divide-y divide-border/20">
                  {(() => {
                      if (mode === "Synastry" && personFocus === "Both") {
                          const dataA = processChartPlanets(natalData, "คนที่ 1", "bg-blue-500/20 text-blue-300 border-blue-500/30");
                          const dataB = processChartPlanets(displayCompareDataB, "คนที่ 2", "bg-pink-500/20 text-pink-300 border-pink-500/30");
                          
                          const order = ["Lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus"];
                          
                          return order.map(pName => {
                              const pA = dataA.find(x => x.nameInEng === pName);
                              const pB = dataB.find(x => x.nameInEng === pName);
                              if (!pA || !pB) return null;
                              
                              const dA = degToSign(pA.lon);
                              const dB = degToSign(pB.lon);

                              return (
                                  <div key={pName} className="p-5 transition-all duration-300 cursor-pointer hover:bg-white/5 border-b border-border/30 last:border-0">
                                      <div className="flex items-center gap-3 mb-4">
                                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/30 font-bold shadow-xl text-[18px] border border-white/5" style={{ color: pA.color }}>
                                              {pA.symbol}
                                          </div>
                                          <div className="font-bold text-[16px] text-white flex items-center gap-2">
                                              {pA.name} 
                                              {pA.isLagna && <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">ลัคนา</span>}
                                          </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3">
                                          {/* Person A */}
                                          <div className="bg-blue-950/20 rounded-xl p-3 border border-blue-500/20 shadow-inner relative overflow-hidden">
                                              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                                              <div className="text-[10px] font-bold text-blue-300 mb-2 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block border border-blue-500/20">คนที่ 1</div>
                                              
                                              <div className="text-[12px] text-white/90 font-bold mb-1">
                                                  {dA.deg}°{String(dA.min).padStart(2, "0")}′ {dA.sign.name_th}
                                              </div>
                                              <div className="text-[11px] font-black text-amber-400/90 mb-2">
                                                  ภพ{typeof pA.house === 'number' ? HOUSE_NAMES_TH[pA.house - 1] : "—"}
                                              </div>
                                              
                                              <div className="flex flex-wrap gap-1 mb-3">
                                                  {pA.dignityList.map((s: string) => (
                                                      <span key={s} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-sm ${getDignityStyle(s)}`}>{s}</span>
                                                  ))}
                                                  {pA.retro && <span className="text-rose-500 font-bold text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">พักร์</span>}
                                              </div>
                                              
                                              <div className="text-[10px] border-t border-blue-500/20 pt-2 mt-2">
                                                  <span className="text-blue-300/60 block font-bold uppercase tracking-wider mb-0.5 text-[9px]">นักษัตร</span>
                                                  <span className="text-white/80 font-bold">{pA.nakshatra}</span>
                                              </div>
                                          </div>

                                          {/* Person B */}
                                          <div className="bg-pink-950/20 rounded-xl p-3 border border-pink-500/20 shadow-inner relative overflow-hidden">
                                              <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50" />
                                              <div className="text-[10px] font-bold text-pink-300 mb-2 bg-pink-500/10 px-2 py-0.5 rounded-md inline-block border border-pink-500/20">คนที่ 2</div>
                                              
                                              <div className="text-[12px] text-white/90 font-bold mb-1">
                                                  {dB.deg}°{String(dB.min).padStart(2, "0")}′ {dB.sign.name_th}
                                              </div>
                                              <div className="text-[11px] font-black text-amber-400/90 mb-2">
                                                  ภพ{typeof pB.house === 'number' ? HOUSE_NAMES_TH[pB.house - 1] : "—"}
                                              </div>
                                              
                                              <div className="flex flex-wrap gap-1 mb-3">
                                                  {pB.dignityList.map((s: string) => (
                                                      <span key={s} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-sm ${getDignityStyle(s)}`}>{s}</span>
                                                  ))}
                                                  {pB.retro && <span className="text-rose-500 font-bold text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">พักร์</span>}
                                              </div>
                                              
                                              <div className="text-[10px] border-t border-pink-500/20 pt-2 mt-2">
                                                  <span className="text-pink-300/60 block font-bold uppercase tracking-wider mb-0.5 text-[9px]">นักษัตร</span>
                                                  <span className="text-white/80 font-bold">{pB.nakshatra}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              );
                          });
                      }

                      // Single Chart View Logic
                      const currentPlanetDict = chartData?.planets;
                      const currentPlanets = currentPlanetDict ? Object.entries(currentPlanetDict).map(([name, p]: [string, any]) => {
                        const naks = chartData?.lunar_data?.planet_nakshatras?.[name];
                        const thaiNak = naks ? getThaiNak(naks.index) : null;
                        
                        let rawList = Array.isArray(p.dignity_list) ? p.dignity_list : (p.dignity ? [p.dignity] : []);
                        if (rawList.length > 1 && rawList.every((s: any) => typeof s === 'string' && s.length === 1)) {
                            rawList = [rawList.join('')];
                        }
                        let allStatuses = [...rawList];
                        if (p.is_retrograde && !allStatuses.includes("พักร์")) allStatuses.push("พักร์");
                        if (p.is_combust && !allStatuses.includes("ดับ")) allStatuses.push("ดับ");
                        if (p.speed_status && p.speed_status !== "Normal" && !allStatuses.includes(p.speed_status)) {
                            const thaiSpeed: any = { "Slow (ช้า)": "มนทร์", "Fast (เร็ว)": "เสริด", "Stationary (หยุด)": "เสริด" };
                            if (thaiSpeed[p.speed_status]) allStatuses.push(thaiSpeed[p.speed_status]);
                        }
                        const isNormal = (s: string) => s.trim() === "ปกติ" || s.includes("ปกติ");
                        if (allStatuses.length > 1 && allStatuses.some(isNormal)) {
                            allStatuses = allStatuses.filter(s => !isNormal(s));
                        }

                        return {
                          name: planetThaiNames[name] || name,
                          nameInEng: name,
                          symbol: p.symbol || name.substring(0, 2),
                          lon: p.longitude,
                          retro: p.is_retrograde,
                          combust: p.is_combust,
                          house: p.house,
                          dignity: p.dignity || "ปกติ",
                          dignityList: allStatuses,
                          nakshatra: thaiNak ? `${thaiNak.name} (${naks?.pada})` : "—",
                          color: planetColors[name] || "var(--accent)",
                          cData: chartData
                        }
                      }) : [];

                      const combinedData = [];
                      const currentLagnaData = chartData?.lagna;
                      if (currentLagnaData) {
                          const n = chartData?.lunar_data?.lagna_nakshatra;
                          const t = n ? getThaiNak(n.index) : null;
                          combinedData.push({
                              isLagna: true,
                              name: "ลัคนา",
                              nameInEng: "Lagna",
                              symbol: "ลั",
                              color: "var(--warning)",
                              lon: currentLagnaData.longitude,
                              nakshatra: t ? `${t.name} (${n?.pada})` : "—",
                              house: 1,
                              dignityList: [],
                              retro: false,
                              cData: chartData
                          });
                      }
                      combinedData.push(...currentPlanets.map(p => ({ ...p, isLagna: false })));

                      return combinedData.map((p, idx) => {
                          const d = degToSign(p.lon);
                          const isSelected = selectedPlanet === p.nameInEng;
                          const houseName = typeof p.house === 'number' ? HOUSE_NAMES_TH[p.house - 1] : "—";
                          
                          const currentLords = chartData?.house_lords;
                          const lordOf = currentLords ? 
                                         Object.entries(currentLords)
                                               .filter(([_, data]) => (data as any).planet === p.nameInEng)
                                               .map(([hNum, _]) => HOUSE_NAMES_TH[parseInt(hNum) - 1]) 
                                         : [];

                          const currentYogas = chartData?.yogas;
                          let yogas = currentYogas ? currentYogas.filter((y: any) => {
                            if (p.isLagna) {
                              const relevantCategories = [
                                "life_path", "power", "abundance", "wealth", "affliction",
                                "raja_yoga", "exchange", "viparita", "cancellation", "wisdom", "support"
                              ];
                              return y.planet === "Lagna" || relevantCategories.includes(y.category);
                            }
                            return y.planet === p.nameInEng;
                          }) : [];

                          if (p.isLagna) {
                              // Group yogas by name to avoid duplicate badges, but combine descriptions
                              const grouped = yogas.reduce((acc: any, y: any) => {
                                  if (!acc[y.name]) {
                                      acc[y.name] = { ...y };
                                  } else {
                                      acc[y.name].description += `\n• ${y.description}`;
                                  }
                                  return acc;
                              }, {});
                              yogas = Object.values(grouped);
                          }

                          return (
                              <div key={`${p.nameInEng}-${idx}`} 
                                   onClick={() => onSelectPlanet(isSelected ? null : p.nameInEng)}
                                   className={`p-5 transition-all duration-300 cursor-pointer border-l-4 ${isSelected ? "bg-primary/5 border-primary shadow-inner" : "hover:bg-white/5 border-transparent"}`}>
                                  
                                  <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/30 font-bold shadow-xl text-[18px] border border-white/5 transition-transform group-hover:scale-110" style={{ color: p.color }}>
                                              {p.symbol}
                                          </div>
                                          <div>
                                              <div className="font-bold text-[15px] text-white flex items-center gap-2">
                                                  {p.name} 
                                                  {p.isLagna && <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">ลัคนา</span>}
                                                  {p.retro && <span className="text-rose-500 font-bold text-[11px] bg-rose-500/10 px-1 rounded" title="โคจรพักร์ (ถอยหลัง)">พักร์</span>}
                                              </div>
                                              <div className="text-[11px] text-muted-foreground font-bold mt-1">
                                                  {d.deg}°{String(d.min).padStart(2, "0")}′ {d.sign.name_th}
                                              </div>
                                          </div>
                                      </div>
                                      <div className="text-right flex flex-col items-end gap-2">
                                          <div className="text-[13px] font-black text-amber-400 tracking-wide">
                                              ภพ{houseName}
                                          </div>
                                          <div className="flex flex-wrap gap-1.5 justify-end">
                                              {p.dignityList.map((s: string) => (
                                                  <span key={s} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm ${getDignityStyle(s)}`}>{s}</span>
                                              ))}
                                          </div>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[11px] mt-4 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                                      <div>
                                          <span className="text-muted-foreground/60 block text-[10px] font-bold uppercase tracking-wider mb-1">นักษัตร</span>
                                          <span className="text-white font-bold">{p.nakshatra}</span>
                                      </div>
                                      {(lordOf.length > 0 || p.isLagna) && (
                                          <div>
                                              <span className="text-muted-foreground/60 block text-[10px] font-bold uppercase tracking-wider mb-1">
                                                {p.isLagna ? "ตนุลัคน์" : "เจ้าเรือน"}
                                              </span>
                                              <span className="text-sky-300 font-bold">
                                                {p.isLagna 
                                                  ? (() => {
                                                      // Primary: Use backend data
                                                      let rulerName = currentLords?.[1]?.planet;
                                                      
                                                      // Fallback: If old chart data is loaded without d3/d9 lords
                                                      if (!rulerName) {
                                                        const sign = currentLagnaData?.sign;
                                                        if (sign) {
                                                          const rulers: { [key: number]: string } = {
                                                            1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
                                                            7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Rahu", 12: "Jupiter"
                                                          };
                                                          rulerName = rulers[sign];
                                                        }
                                                      }
                                                      return (rulerName && planetThaiNames[rulerName]) || rulerName || "—";
                                                    })()
                                                  : lordOf.join(", ")}
                                              </span>
                                          </div>
                                      )}
                                  </div>

                                  {yogas.length > 0 && (
                                      <div className="mt-4 text-[11px] leading-tight flex flex-wrap gap-2 items-center">
                                          <span className="text-muted-foreground font-bold text-[10px] uppercase">เกณฑ์/โยค:</span>
                                          {yogas.map((y: any, i: number) => (
                                              <span key={i} className={`px-2 py-1 rounded-lg bg-white/5 font-bold border border-border/30 transition-colors hover:border-primary/50 ${y.score < 0 ? "text-rose-400" : "text-emerald-400"}`} title={y.description}>
                                                  {y.name}
                                              </span>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          );
                      });
                  })()}
              </div>
            )}

            {tab === "ตารางดาว" && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground/60">
                      <th className="py-2 px-1 text-left font-black uppercase tracking-wider text-[10px]">ดาว</th>
                      <th className="py-2 px-1 text-left font-black uppercase tracking-wider text-[10px]">องศา/ลิปตา</th>
                      <th className="py-2 px-1 text-left font-black uppercase tracking-wider text-[10px]">ราศี</th>
                      <th className="py-2 px-1 text-left font-black uppercase tracking-wider text-[10px]">มาตรฐาน/สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {(() => {
                        const planetsList = processChartPlanets(chartData);
                        return planetsList.map((p, idx) => {
                            const d = degToSign(p.lon);
                            return (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[14px]" style={{ color: p.color }}>{p.symbol}</span>
                                            <span className="text-white/80 font-bold text-[11px]">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-1">
                                        <span className="text-white font-mono font-bold">{d.deg}°{String(d.min).padStart(2, '0')}′</span>
                                    </td>
                                    <td className="py-3 px-1">
                                        <span className="text-muted-foreground font-bold">{d.sign.name_th}</span>
                                    </td>
                                    <td className="py-3 px-1">
                                        <div className="flex flex-wrap gap-1">
                                            {p.dignityList.map((s: string) => (
                                                <span key={s} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getDignityStyle(s)}`}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        });
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "การทำมุม" && (
              <div className="p-0 pb-12">
                <div className="bg-primary/5 p-5 border-b border-border/50">
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-primary flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow" />
                        {mode === "Synastry" && personFocus === "Both" ? "มุมสัมพันธ์ระหว่างบุคคล" : `มุมสัมพันธ์ระหว่างดาว (${chartType})`}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium">แสดงกระแสสัมพันธ์และมุมองศาที่ดาวส่งถึงกันในดวงชะตา</p>
                </div>

                {(() => {
                  let currentAspects = chartData?.western_aspects;
                  
                  if (mode === "Synastry" && personFocus === "Both") {
                    currentAspects = compareData?.synastry_aspects;
                  }

                  if (!currentAspects || currentAspects.length === 0) {
                    return (
                        <div className="p-16 text-center text-[11px] text-muted-foreground/30 italic font-medium tracking-widest">
                            ไม่พบการทำมุมที่สำคัญใน {mode === "Synastry" && personFocus === "Both" ? "ดวงสมพงษ์" : chartType}
                        </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-border/20">
                        {[0, 180, 120, 90, 60, 30, 150].map(angle => {
                            const group = currentAspects.filter(a => a.angle === angle);
                            if (group.length === 0) return null;
                            const info = ASPECT_LABELS[angle] || { label: `${angle}°`, color: "#fff", desc: "" };

                            return (
                                <div key={angle} className="p-5 hover:bg-white/5 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="h-2.5 w-2.5 rounded-full shadow-lg" style={{ backgroundColor: info.color, boxShadow: `0 0 10px ${info.color}60` }} />
                                            <span className="font-black text-[14px] tracking-tight" style={{ color: info.color }}>
                                                {info.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground/40 px-2 py-0.5 rounded-lg border border-border">
                                            ระยะเอื้อม ≤ 5°
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground/70 mb-4 font-medium leading-relaxed">{info.desc}</p>
                                    <div className="space-y-2">
                                        {group.map((a, i) => (
                                            <div key={i} className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 hover:border-primary/20 transition-all group/aspect shadow-inner">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        {mode === "Synastry" && personFocus === "Both" ? (
                                                            <>
                                                                <div className="flex items-center gap-1.5 bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/20">
                                                                    <span className="text-blue-400 text-[9px] font-bold">คนที่ 1</span>
                                                                    <span className="font-bold text-white text-[13px]">{a.p1 ? (planetThaiNames[a.p1] || a.p1) : "—"}</span>
                                                                </div>
                                                                <span className="text-muted-foreground/50 text-[10px] px-1">ทำมุมกับ</span>
                                                                <div className="flex items-center gap-1.5 bg-pink-500/5 px-2 py-1 rounded-lg border border-pink-500/20">
                                                                    <span className="text-pink-400 text-[9px] font-bold">คนที่ 2</span>
                                                                    <span className="font-bold text-white text-[13px]">{a.p2 ? (planetThaiNames[a.p2] || a.p2) : "—"}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="font-bold text-white text-[13px]">{a.p1 ? (planetThaiNames[a.p1] || a.p1) : "—"}</span>
                                                                <span className="text-muted-foreground/30 text-[11px]">+</span>
                                                                <span className="font-bold text-white text-[13px]">{a.p2 ? (planetThaiNames[a.p2] || a.p2) : "—"}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 shadow-sm">
                                                    {a.actual_diff.toFixed(1)}°
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  );
                })()}
                
                <div className="mt-8 p-6 border-t border-border/30 text-center">
                    <p className="text-[11px] text-muted-foreground italic opacity-40 font-medium">
                        * ข้อมูลนี้แสดงกระแสสัมพันธ์เชิงมุมแบบสากลและเวทผสมผสาน
                    </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
