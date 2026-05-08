"use client";
// Updated to support DASHA type

import { useState } from "react";
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

export function RightPanel({ chartData: natalData, compareData, mode, chartType, selectedPlanet, onSelectPlanet }: Props) {
  const [tab, setTab] = useState<Tab>("ข้อมูลดาว");
  const [personFocus, setPersonFocus] = useState<"A" | "B" | "Both">("A");

  const chartData = (mode === "Synastry" && personFocus === "B") ? compareData?.person_b_chart : natalData;
  
  const planetThaiNames: { [key: string]: string } = {
      Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
      Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ", Uranus: "มฤตยู"
  };
  
  const planetThaiNumbers: { [key: string]: string } = {
      Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔",
      Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘", Ketu: "๙", Uranus: "๐"
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
    // Standardize to bright text colors for dark mode readability
    if (dignity.includes("มหาอุจจ์")) return "bg-blue-600 text-white font-bold shadow-[0_0_8px_rgba(37,99,235,0.5)]";
    if (dignity.includes("อุจจ์")) return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
    if (dignity.includes("เกษตร")) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
    if (dignity.includes("มหาจักร")) return "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40";
    if (dignity.includes("ราชาโชค") || dignity.includes("เทวีโชค")) return "bg-amber-500/20 text-amber-300 border border-amber-500/40";
    if (dignity.includes("วรโคตม")) return "bg-sky-500/20 text-sky-300 border border-sky-500/40";
    if (dignity.includes("พักร์") || dignity.includes("ดับ")) return "bg-rose-500/20 text-rose-300 border border-rose-500/40";
    if (dignity.includes("ประ") || dignity.includes("นิจ")) return "bg-red-500/10 text-red-400/80 border border-red-500/20";
    return "bg-slate-700/50 text-slate-300 border border-slate-600/50";
  };

  const planets = chartData ? Object.entries(chartData.planets).map(([name, p]) => {
    const naks = chartData.lunar_data?.planet_nakshatras?.[name];
    const thaiNak = naks ? getThaiNak(naks.index) : null;
    
    let rawList = Array.isArray(p.dignity_list) ? p.dignity_list : (p.dignity ? [p.dignity] : []);
    if (rawList.length > 1 && rawList.every(s => typeof s === 'string' && s.length === 1)) {
        rawList = [rawList.join('')];
    }
    let allStatuses = [...rawList];
    if (p.is_retrograde && !allStatuses.includes("พักร์")) allStatuses.push("พักร์");
    if (p.is_combust && !allStatuses.includes("ดับ")) allStatuses.push("ดับ");
    if (p.speed_status && p.speed_status !== "Normal" && !allStatuses.includes(p.speed_status)) {
        const thaiSpeed: any = { "Slow (ช้า)": "มนทร์", "Fast (เร็ว)": "เสริด", "Stationary (หยุด)": "เสริด" };
        if (thaiSpeed[p.speed_status]) allStatuses.push(thaiSpeed[p.speed_status]);
    }
    
    // Filter out "ปกติ" if there are other meaningful statuses
    if (allStatuses.length > 1) {
        allStatuses = allStatuses.filter(s => s !== "ปกติ");
    }

    return {
      name: planetThaiNames[name] || name,
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

  const lagna = chartData?.lagna ? {
    name: "ลัคนา",
    symbol: "ลั",
    lon: chartData.lagna.longitude,
    nakshatra: (() => {
        const n = chartData.lunar_data.lagna_nakshatra;
        const t = n ? getThaiNak(n.index) : null;
        return t ? `${t.name} (${n.pada})` : "—";
    })(),
    nakCategory: (() => {
        const n = chartData.lunar_data.lagna_nakshatra;
        const t = n ? getThaiNak(n.index) : null;
        return t ? `${t.category}ฤกษ์` : "";
    })(),
    color: "var(--warning)"
  } : null;

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card/40 overflow-hidden">
      <div className="flex border-b border-border bg-muted/30">
        {(["ข้อมูลดาว", "การทำมุม"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {!chartData ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-xs text-muted-foreground/50 font-mono">
            รอการคำนวณข้อมูลชะตา...
          </div>
        ) : (
          <>
            {mode === "Synastry" && (
                <div className="flex gap-1 p-2 bg-muted/20 border-b border-border/50">
                    <button 
                        onClick={() => setPersonFocus("A")}
                        className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${
                            personFocus === "A" ? "bg-[#3b82f6] text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        คนที่ 1
                    </button>
                    <button 
                        onClick={() => setPersonFocus("B")}
                        className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${
                            personFocus === "B" ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        คนที่ 2
                    </button>
                    <button 
                        onClick={() => setPersonFocus("Both")}
                        className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${
                            personFocus === "Both" ? "bg-(image:--gradient-gold) text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        สัมพันธ์
                    </button>
                </div>
            )}
            {tab === "ข้อมูลดาว" && (
              <div className="p-0 pb-10 divide-y divide-border/30">
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
                      
                      const planetItems = planets.map((p, idx) => ({
                          isLagna: false,
                          nameInEng: Object.keys(chartData.planets)[idx],
                          name: p.name,
                          symbol: p.symbol,
                          color: p.color,
                          lon: p.lon,
                          nakshatra: p.nakshatra,
                          house: p.house,
                          dignityList: p.dignityList,
                          retro: p.retro
                      }));

                      const combinedData = [];
                      if (lagnaItem) combinedData.push(lagnaItem);
                      combinedData.push(...planetItems);

                      return combinedData.map((p) => {
                          const d = degToSign(p.lon);
                          const isSelected = selectedPlanet === p.nameInEng;
                          const houseName = typeof p.house === 'number' ? HOUSE_NAMES_TH[p.house - 1] : "—";
                          
                          // Find lordships
                          const lordOf = chartData.house_lords ? 
                                         Object.entries(chartData.house_lords)
                                               .filter(([_, data]) => (data as any).planet === p.nameInEng)
                                               .map(([hNum, _]) => HOUSE_NAMES_TH[parseInt(hNum) - 1]) 
                                         : [];

                          // Find Yogas
                          const yogas = chartData.yogas ? chartData.yogas.filter(y => y.planet === p.nameInEng) : [];

                          return (
                              <div key={p.nameInEng} 
                                   onClick={() => onSelectPlanet(isSelected ? null : p.nameInEng)}
                                   className={`p-4 transition-colors cursor-pointer ${isSelected ? "bg-primary/10" : "hover:bg-muted/20"}`}>
                                  
                                  <div className="flex justify-between items-start mb-2.5">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/40 font-black shadow-inner text-[15px]" style={{ color: p.color, textShadow: `0 0 5px ${p.color}40` }}>
                                              {p.symbol}
                                          </div>
                                          <div>
                                              <div className="font-bold text-[13px] text-white flex items-center gap-1.5">
                                                  {p.name} {p.isLagna && <span className="text-[9px] bg-warning/20 text-warning px-1 rounded uppercase tracking-wider">ลัคนา</span>}
                                                  {p.retro && <span className="text-rose-500 font-black text-[10px]" title="โคจรพักร์ (ถอยหลัง)">℞</span>}
                                              </div>
                                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                                  {d.deg}°{String(d.min).padStart(2, "0")}′ {d.sign.name_th}
                                              </div>
                                          </div>
                                      </div>
                                      <div className="text-right flex flex-col items-end gap-1.5">
                                          <div className="text-[12px] font-black text-amber-400">
                                              ภพ{houseName}
                                          </div>
                                          <div className="flex flex-wrap gap-1 justify-end">
                                              {p.dignityList.map((s: string) => (
                                                  <span key={s} className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold ${getDignityStyle(s)}`}>{s}</span>
                                              ))}
                                          </div>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-[10px] mt-3 bg-black/20 p-2.5 rounded border border-white/5">
                                      <div>
                                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wider mb-0.5">นักษัตร</span>
                                          <span className="text-white/90">{p.nakshatra}</span>
                                      </div>
                                      {lordOf.length > 0 && (
                                          <div>
                                              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider mb-0.5">เจ้าเรือน</span>
                                              <span className="text-sky-300 font-semibold">{lordOf.join(", ")}</span>
                                          </div>
                                      )}
                                  </div>

                                  {yogas.length > 0 && (
                                      <div className="mt-2.5 text-[10px] leading-tight flex flex-wrap gap-1.5 items-center">
                                          <span className="text-muted-foreground font-semibold">เกณฑ์/โยค:</span>
                                          {yogas.map((y: any, i: number) => (
                                              <span key={i} className={`px-1.5 py-0.5 rounded-[3px] bg-muted/40 font-bold border border-border/50 ${y.score < 0 ? "text-rose-400" : "text-emerald-400"}`} title={y.description}>
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
              <div className="p-0 pb-10">
                <div className="bg-primary/5 p-3 border-b border-border">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        {mode === "Synastry" && personFocus === "Both" ? "มุมสัมพันธ์ระหว่างบุคคล" : `มุมสัมพันธ์ระหว่างดาว (${chartType})`}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1">แสดงกระแสสัมพันธ์และมุมองศาที่ดาวส่งถึงกันในดวงชะตา</p>
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
                        <div className="p-10 text-center text-[10px] text-muted-foreground italic uppercase tracking-widest">
                            ไม่พบการทำมุมที่สำคัญใน {mode === "Synastry" && personFocus === "Both" ? "ดวงสัมพงษ์" : chartType}
                        </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-border/30">
                        {[0, 180, 120, 90, 60, 30, 150].map(angle => {
                            const group = currentAspects.filter(a => a.angle === angle);
                            if (group.length === 0) return null;
                            const info = ASPECT_LABELS[angle] || { label: `${angle}°`, color: "#fff", desc: "" };

                            return (
                                <div key={angle} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
                                            <span className="font-black text-[12px] uppercase tracking-tighter" style={{ color: info.color }}>
                                                {info.label}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground/60 px-1.5 py-0.5 rounded border border-border">
                                            ระยะเอื้อม ≤ 5°
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mb-3 font-medium leading-relaxed">{info.desc}</p>
                                    <div className="space-y-1.5">
                                        {group.map((a, i) => (
                                            <div key={i} className="flex items-center justify-between bg-black/20 rounded p-2 border border-white/5 group/aspect">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-white text-[11px]">{planetThaiNames[a.p1] || a.p1}</span>
                                                        <span className="text-muted-foreground/40 text-[10px]">+</span>
                                                        <span className="font-bold text-white text-[11px]">{planetThaiNames[a.p2] || a.p2}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-mono text-primary/80 bg-primary/5 px-1.5 rounded">
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
                
                <div className="mt-6 p-4 border-t border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground italic opacity-60">
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
