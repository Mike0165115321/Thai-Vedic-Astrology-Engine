"use client";

import { useState } from "react";
import { SIGNS } from "./data";
import { ChartData, CompareResponse } from "@/types/chart";
import { THAI_NAKSHATRAS } from "./nakshatra_data";

type Tab = "ตำแหน่งดาว" | "ดาว" | "เจ้าเรือน";

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
        {(["ตำแหน่งดาว", "ดาว", "เจ้าเรือน"] as Tab[]).map((t) => (
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
                                            <div key={y.name} className="text-[11px] text-sky-400 font-bold leading-tight mb-1">
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
          </>
        )}
      </div>

      {/* Dasha Gantt (Connected to Layer 1G) */}
      <div className="border-t border-border bg-card/60 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>วิมโชตตรีทศา (Vimshottari Dasha)</span>
          <span className="font-mono text-primary">LIVE</span>
        </div>
        <div className="relative h-8 overflow-hidden rounded border border-border bg-muted/40">
          {dashaTimeline.length > 0 ? (
            <>
                {dashaTimeline.map((d, i) => {
                    const width = (100 / dashaTimeline.length);
                    const left = i * width;
                    const dashaColors: { [key: string]: string } = {
                        Sun: "#FCD34D", Moon: "#E2E8F0", Mars: "#EF4444", Mercury: "#10B981",
                        Jupiter: "#8B5CF6", Venus: "#EC4899", Saturn: "#4B5563", Rahu: "#1F2937", Ketu: "#9CA3AF"
                    };
                    return (
                        <div key={d.planet + d.start}
                            className={`absolute top-0 flex h-full items-center justify-center border-r border-background/20 text-[8px] font-bold text-background transition-all hover:brightness-110 cursor-help ${d.is_current ? "ring-2 ring-primary ring-inset" : ""}`}
                            style={{ left: `${left}%`, width: `${width}%`, background: dashaColors[d.planet] || "#ccc" }}
                            title={`${d.planet}: ${new Date(d.start).getFullYear()} - ${new Date(d.end).getFullYear()}`}>
                            {d.planet.substring(0, 2)}
                        </div>
                    );
                })}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground italic">
                กรอกข้อมูลเพื่อคำนวณทศา
            </div>
          )}
        </div>
        <div className="mt-1.5 flex justify-between text-[8px] text-muted-foreground font-mono">
            {dashaTimeline.length > 0 && (
                <>
                    <span>{new Date(dashaTimeline[0].start).getFullYear()}</span>
                    <span>{new Date(dashaTimeline[dashaTimeline.length-1].end).getFullYear()}</span>
                </>
            )}
        </div>
      </div>
    </aside>
  );
}