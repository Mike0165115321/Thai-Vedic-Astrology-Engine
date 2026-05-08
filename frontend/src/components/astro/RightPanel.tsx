"use client";

import { useState, useMemo } from "react";
import { SIGNS } from "./data";
import { ChartData, CompareResponse } from "@/types/chart";
import { THAI_NAKSHATRAS } from "./nakshatra_data";

type Tab = "ข้อมูลดาว" | "การทำมุม";

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

export function RightPanel({ chartData: natalData, transitData, compareData, mode, chartType, selectedPlanet, onSelectPlanet }: Props) {
  const [tab, setTab] = useState<Tab>("ข้อมูลดาว");
  const [personFocus, setPersonFocus] = useState<"A" | "B" | "Both">("A");

  const chartData = useMemo(() => {
    if (mode === "Transit") return transitData;
    if (mode === "Synastry") {
      return personFocus === "B" ? compareData?.person_b_chart : natalData;
    }
    return natalData;
  }, [mode, personFocus, natalData, transitData, compareData]);
  
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

  const planets = chartData ? Object.entries(chartData.planets).map(([name, p]: [string, any]) => {
    const naks = chartData.lunar_data?.planet_nakshatras?.[name];
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
      nakshatra: thaiNak ? `${thaiNak.name} (${naks.pada})` : "—",
      nakCategory: thaiNak ? `${thaiNak.category}ฤกษ์` : "",
      lordships: p.lordships || [],
      color: planetColors[name] || "var(--accent)"
    }
  }) : [];

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card/40 overflow-hidden font-sans">
      <div className="flex flex-col gap-4 px-5 pt-5 pb-3 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-glow" />
                  {mode === "Transit" ? "ข้อมูลดาวจรปัจจุบัน" : (mode === "Synastry" ? `ข้อมูลดวงชะตา (${personFocus === "A" ? "คนแรก" : "คนที่สอง"})` : "ข้อมูลดวงชะตา")}
              </h2>
          </div>
          
          <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5 shadow-inner">
        {(["ข้อมูลดาว", "การทำมุม"] as Tab[]).map((t) => (
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
        {!chartData ? (
          <div className="flex h-full items-center justify-center p-10 text-center text-[11px] text-muted-foreground/40 italic font-medium tracking-widest">
            รอการคำนวณข้อมูลชะตา...
          </div>
        ) : (
          <>
            {mode === "Synastry" && (
                <div className="flex gap-2 p-3 bg-muted/20 border-b border-border/50">
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
                      const getThaiNak = (index: number) => {
                          return THAI_NAKSHATRAS.find(n => n.id === index) || null;
                      };

                      const lagnaItem = chartData.lagna ? { 
                          isLagna: true, 
                          name: "ลัคนา",
                          nameInEng: "Lagna",
                          symbol: "ลั", 
                          color: "var(--warning)", 
                          lon: chartData.lagna.longitude,
                          nakshatra: (() => {
                              const n = chartData.lunar_data?.lagna_nakshatra;
                              const t = n ? getThaiNak(n.index) : null;
                              return t ? `${t.name} (${n.pada})` : "—";
                          })(),
                          house: 1,
                          dignityList: [],
                          retro: false
                      } : null;
                      
                      const planetItems = planets.map((p) => ({
                          ...p,
                          isLagna: false
                      }));

                      const combinedData = [];
                      if (lagnaItem) combinedData.push(lagnaItem);
                      combinedData.push(...planetItems);

                      return combinedData.map((p) => {
                          const d = degToSign(p.lon);
                          const isSelected = selectedPlanet === p.nameInEng;
                          const houseName = typeof p.house === 'number' ? HOUSE_NAMES_TH[p.house - 1] : "—";
                          
                          const lordOf = chartData.house_lords ? 
                                         Object.entries(chartData.house_lords)
                                               .filter(([_, data]) => (data as any).planet === p.nameInEng)
                                               .map(([hNum, _]) => HOUSE_NAMES_TH[parseInt(hNum) - 1]) 
                                         : [];

                          const yogas = chartData.yogas ? chartData.yogas.filter(y => y.planet === p.nameInEng) : [];

                          return (
                              <div key={p.nameInEng} 
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
                                      {lordOf.length > 0 && (
                                          <div>
                                              <span className="text-muted-foreground/60 block text-[10px] font-bold uppercase tracking-wider mb-1">เจ้าเรือน</span>
                                              <span className="text-sky-300 font-bold">{lordOf.join(", ")}</span>
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
                  let currentAspects = chartType === "D3" ? chartData?.d3_western_aspects : 
                                       chartType === "D9" ? chartData?.d9_western_aspects : 
                                       chartData?.western_aspects;
                  
                  if (mode === "Synastry" && personFocus === "Both") {
                    currentAspects = compareData?.synastry_aspects;
                  }

                  if (!currentAspects || currentAspects.length === 0) {
                    return (
                        <div className="p-16 text-center text-[11px] text-muted-foreground/30 italic font-medium tracking-widest">
                            ไม่พบการทำมุมที่สำคัญใน {mode === "Synastry" && personFocus === "Both" ? "ดวงสัมพงษ์" : chartType}
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
                                                        <span className="font-bold text-white text-[13px]">{planetThaiNames[a.p1] || a.p1}</span>
                                                        <span className="text-muted-foreground/30 text-[11px]">+</span>
                                                        <span className="font-bold text-white text-[13px]">{planetThaiNames[a.p2] || a.p2}</span>
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
