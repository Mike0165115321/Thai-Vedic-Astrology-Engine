"use client";

import { useState } from "react";
import { SIGNS } from "./data";
import { ChartData, CompareResponse } from "@/types/chart";
import { THAI_NAKSHATRAS } from "./nakshatra_data";

type Tab = "ตำแหน่งดาว" | "ดาว" | "เจ้าเรือน" | "ทศา";

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

export function RightPanel({ chartData: natalData, compareData, mode, chartType, selectedPlanet, onSelectPlanet }: Props) {
  const [tab, setTab] = useState<Tab>("ตำแหน่งดาว");
  const [personFocus, setPersonFocus] = useState<"A" | "B">("A");

  const chartData = (mode === "Synastry" && personFocus === "B") ? compareData?.person_b_chart : natalData;
  
  // Use real dasha timeline if available, otherwise empty
  const dashaTimeline = chartData?.dasha_timeline || [];
  
  const planetThaiNames: { [key: string]: string } = {
      Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
      Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ"
  };

  const planetColors: { [key: string]: string } = {
      Sun: "var(--warning)", Moon: "#cfd6e4", Mars: "var(--destructive)",
      Jupiter: "var(--primary)", Venus: "#f5b8e0", Mercury: "var(--info)",
      Saturn: "#94a3b8", Rahu: "#f59e0b", Ketu: "#fbbf24"
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
    
    // Status list aggregation
    // Status list aggregation - Robust check for accidentally split strings
    let rawList = Array.isArray(p.dignity_list) ? p.dignity_list : (p.dignity ? [p.dignity] : []);
    // If it's a list of single chars, join them (fixes Python list("ปกติ") bug)
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
    
    // Clean "ปกติ" if other statuses exist
    if (allStatuses.length > 1 && allStatuses.includes("ปกติ")) {
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
    <aside className="flex flex-col border-l border-border bg-card/40 overflow-hidden">
      <div className="flex border-b border-border bg-muted/30">
        {(["ตำแหน่งดาว", "ดาว", "เจ้าเรือน", "ทศา"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition ${
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
                        คนที่ 1 (Person A)
                    </button>
                    <button 
                        onClick={() => setPersonFocus("B")}
                        className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${
                            personFocus === "B" ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        คนที่ 2 (Person B)
                    </button>
                </div>
            )}
            {tab === "ตำแหน่งดาว" && (
              <table className="w-full border-collapse text-[12px] font-mono">
                <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-3 py-2.5 font-semibold">ดาว</th>
                    <th className="px-3 py-2.5 font-semibold">องศา/ราศี</th>
                    <th className="px-3 py-2.5 font-semibold text-center">นพเคราะห์</th>
                    <th className="px-3 py-2.5 font-semibold text-right">สถิตเรือน</th>
                  </tr>
                </thead>
                <tbody>
                  {lagna && (
                    <tr className="border-b border-border bg-primary/5">
                      <td className="px-3 py-2.5">
                        <span className="mr-2 font-bold" style={{ color: lagna.color }}>{lagna.symbol}</span>
                        <span className="text-white font-bold">{lagna.name}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {(() => {
                          const d = degToSign(lagna.lon);
                          return (
                            <>
                              <div className="text-white font-bold">{d.deg}°{String(d.min).padStart(2, "0")}′</div>
                              <div className="text-[10px] text-muted-foreground">{d.sign.symbol} {d.sign.name_th}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="text-white">{lagna.nakshatra}</div>
                        <div className="text-[11px] text-sky-400 font-bold">{lagna.nakCategory}</div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-amber-400 text-[13px]">
                        ตนุ
                      </td>
                    </tr>
                  )}
                  {planets.map((p, idx) => {
                    const d = degToSign(p.lon);
                    const nameInEng = Object.keys(chartData.planets)[idx];
                    const isSelected = selectedPlanet === nameInEng;
                    

                    return (
                      <tr key={p.name} 
                          onClick={() => onSelectPlanet(isSelected ? null : nameInEng)}
                          className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${isSelected ? "bg-primary/10" : ""}`}>
                        <td className="px-3 py-2.5">
                          <span className="mr-2 font-bold" style={{ color: p.color }}>{p.symbol}</span>
                          <span className="text-white/90 font-bold">{p.name}</span>
                          {p.retro && <span className="ml-1 text-rose-500 font-black">℞</span>}
                        </td>
                        <td className="px-3 py-2.5">
                            <div className="text-white font-bold">{d.deg}°{String(d.min).padStart(2, "0")}′</div>
                            <div className="text-[10px] text-muted-foreground">{d.sign.symbol} {d.sign.name_th}</div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                            <div className="text-white">{p.nakshatra}</div>
                            <span className="text-[11px] text-sky-400/80 font-bold">{p.nakCategory}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-black text-white text-[13px]">
                            {typeof p.house === 'number' ? HOUSE_NAMES_TH[p.house - 1] : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {tab === "ดาว" && (
              <div className="p-0 overflow-auto pb-20">
                <table className="w-full border-collapse text-[13px] font-mono">
                  <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="px-4 py-3 font-semibold">ดาว</th>
                      <th className="px-4 py-3 font-semibold">ราศี</th>
                      <th className="px-4 py-3 font-semibold">สถานะทั้งหมด ({chartType})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map((p, idx) => {
                      return (
                        <tr key={p.name} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-bold" style={{ color: p.color }}>
                                {p.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                                const d = degToSign(p.lon);
                                return <span className="text-muted-foreground">{d.sign.symbol} {d.sign.name_th}</span>;
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {p.dignityList.length > 0 ? (
                                p.dignityList.map(s => (
                                  <span key={s} className={`px-2 py-1 rounded-[3px] text-[11px] font-bold ${getDignityStyle(s)}`}>{s}</span>
                                ))
                              ) : <span className="text-white/20">ปกติ</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                <div className="text-[12px] text-muted-foreground italic text-center py-8 opacity-40 border-t border-border/50">
                    กำลังดาว (Shadbala) กำลังถูกคำนวณ...
                </div>
              </div>
            )}

            {tab === "เจ้าเรือน" && (
              <div className="p-0 overflow-auto">
                <table className="w-full border-collapse text-[12px] font-mono">
                    <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                        <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                            <th className="px-4 py-2.5 font-semibold">ภพ</th>
                            <th className="px-4 py-2.5 font-semibold text-center">เจ้าเรือน</th>
                            <th className="px-4 py-2.5 font-semibold text-right">เกณฑ์/โยค</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const houseNum = i + 1;
                            const data = chartData.house_lords?.[houseNum as any];
                            return (
                                <tr key={houseNum} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-white font-bold">{HOUSE_NAMES_TH[i]}</td>
                                    <td className="px-4 py-3 text-center">
                                        {data ? (
                                            <span className="text-amber-400 font-black">
                                                {planetThaiNames[data.planet] || data.planet}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {chartData.yogas?.filter(y => y.house === houseNum).map(y => (
                                            <div key={`${y.name}-${y.planet}`} 
                                                 className={`text-[11px] font-bold leading-tight mb-1 ${y.score < 0 ? "text-rose-500" : "text-sky-400"}`}
                                                 title={y.description}>
                                                {y.name}
                                            </div>
                                        ))}
                                        {(!chartData.yogas || chartData.yogas.filter(y => y.house === houseNum).length === 0) && (
                                            <span className="text-[10px] text-muted-foreground/20 italic">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
            )}

            {tab === "ทศา" && (
                <div className="flex flex-col h-full bg-slate-900/20">
                    {/* Dasha Visualization Section */}
                    <div className="p-4 border-b border-border/50 bg-card/30">
                        <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <span>Vimshottari Timeline</span>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                                <span>ปัจจุบัน</span>
                            </div>
                        </div>

                        <div className="relative h-[72px] overflow-hidden rounded-xl border border-white/10 bg-black/40 flex flex-col gap-1 p-1 shadow-inner">
                            {dashaTimeline.length > 0 ? (
                                <>
                                    <div className="relative h-7 w-full rounded-md overflow-hidden">
                                        {(() => {
                                            const firstStart = new Date(dashaTimeline[0].start).getTime();
                                            const lastEnd = new Date(dashaTimeline[dashaTimeline.length - 1].end).getTime();
                                            const totalDuration = lastEnd - firstStart;
                                            let currentLeft = 0;

                                            return dashaTimeline.map((d) => {
                                                const start = new Date(d.start).getTime();
                                                const end = new Date(d.end).getTime();
                                                const duration = end - start;
                                                const width = (duration / totalDuration) * 100;
                                                const left = currentLeft;
                                                currentLeft += width;

                                                const dashaColors: { [key: string]: string } = {
                                                    Sun: "#FCD34D", Moon: "#E2E8F0", Mars: "#EF4444", Mercury: "#10B981",
                                                    Jupiter: "#8B5CF6", Venus: "#EC4899", Saturn: "#4B5563", Rahu: "#1F2937", Ketu: "#9CA3AF"
                                                };

                                                const planetToNumber: { [key: string]: string } = {
                                                    Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔",
                                                    Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘", Ketu: "๙"
                                                };

                                                return (
                                                    <div key={d.planet + d.start}
                                                        className={`absolute top-0 flex h-full items-center justify-center border-r border-background/10 text-[10px] font-black text-background transition-all hover:brightness-110 cursor-help ${d.is_current ? "ring-2 ring-white ring-inset z-10" : "opacity-30"}`}
                                                        style={{ left: `${left}%`, width: `${width}%`, background: dashaColors[d.planet] || "#ccc" }}
                                                        title={`${planetThaiNames[d.planet] || d.planet}: ${new Date(d.start).toLocaleDateString('th-TH')}`}>
                                                        {planetToNumber[d.planet]}
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <div className="relative h-9 w-full rounded-md bg-black/20 overflow-hidden">
                                        {(() => {
                                            const currentM = dashaTimeline.find(d => d.is_current);
                                            if (!currentM || !currentM.antardashas) return null;

                                            const firstStart = new Date(currentM.antardashas[0].start).getTime();
                                            const lastEnd = new Date(currentM.antardashas[currentM.antardashas.length - 1].end).getTime();
                                            const totalDuration = lastEnd - firstStart;

                                            const planetToNumber: { [key: string]: string } = {
                                                Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔",
                                                Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘", Ketu: "๙"
                                            };

                                            return currentM.antardashas.map((a: any) => {
                                                const start = new Date(a.start).getTime();
                                                const end = new Date(a.end).getTime();
                                                const left = ((start - firstStart) / totalDuration) * 100;
                                                const width = ((end - start) / totalDuration) * 100;

                                                const dashaColors: { [key: string]: string } = {
                                                    Sun: "#FCD34D", Moon: "#E2E8F0", Mars: "#EF4444", Mercury: "#10B981",
                                                    Jupiter: "#8B5CF6", Venus: "#EC4899", Saturn: "#4B5563", Rahu: "#1F2937", Ketu: "#9CA3AF"
                                                };

                                                return (
                                                    <div key={a.planet + a.start}
                                                        className={`absolute top-0 flex flex-col items-center justify-center border-r border-background/20 text-[9px] font-bold text-background transition-all hover:brightness-110 cursor-help ${a.is_current ? "ring-2 ring-primary ring-inset z-20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]" : "opacity-70"}`}
                                                        style={{ left: `${left}%`, width: `${width}%`, background: dashaColors[a.planet] || "#ccc" }}
                                                        title={`แทรก ${planetThaiNames[a.planet] || a.planet}: ${new Date(a.start).toLocaleDateString('th-TH')}`}>
                                                        <span>{planetToNumber[a.planet]}</span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Detailed Antardasha List */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full border-collapse text-[12px] font-mono">
                            <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/50">
                                    <th className="px-4 py-3 font-bold">คู่ทศา (เสวย/แทรก)</th>
                                    <th className="px-4 py-3 font-bold text-right">วันเริ่มต้น - สิ้นสุด (พ.ศ.)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const currentM = dashaTimeline.find(d => d.is_current);
                                    if (!currentM || !currentM.antardashas) return null;

                                    const planetToNumber: { [key: string]: string } = {
                                        Sun: "๑", Moon: "๒", Mars: "๓", Mercury: "๔",
                                        Jupiter: "๕", Venus: "๖", Saturn: "๗", Rahu: "๘", Ketu: "๙"
                                    };

                                    return currentM.antardashas.map((a: any) => {
                                        const sDate = new Date(a.start);
                                        const eDate = new Date(a.end);
                                        
                                        return (
                                            <tr key={a.planet + a.start} className={`border-b border-border/20 ${a.is_current ? "bg-primary/10" : "hover:bg-white/5"}`}>
                                                <td className="px-4 py-3 flex items-center gap-2">
                                                    <span className="text-lg font-black text-white">{planetToNumber[currentM.planet]}/{planetToNumber[a.planet]}</span>
                                                    <span className="text-[10px] text-muted-foreground">({planetThaiNames[currentM.planet]}/{planetThaiNames[a.planet]})</span>
                                                    {a.is_current && <span className="text-[9px] bg-primary text-black px-1 rounded font-bold animate-pulse">NOW</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="text-white font-bold">
                                                        {sDate.getDate()} {sDate.toLocaleDateString('th-TH', { month: 'short' })} {sDate.getFullYear() + 543}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        ถึง {eDate.getDate()} {eDate.toLocaleDateString('th-TH', { month: 'short' })} {eDate.getFullYear() + 543}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                        
                        <div className="p-4 text-center">
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest italic">
                                * รอบทศา 120 ปี คำนวณตามมาตรฐานวิมโชตตรีทศา
                            </p>
                        </div>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
