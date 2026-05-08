"use client";

import { useState } from "react";
import { SIGNS } from "./data";
import { ChartData } from "@/types/chart";
import { THAI_NAKSHATRAS } from "./nakshatra_data";

type Tab = "ตำแหน่งดาว" | "กำลังดาว" | "เกณฑ์พิเศษ";

function degToSign(lon: number) {
  const i = Math.floor(lon / 30);
  const deg = lon - i * 30;
  const m = Math.floor((deg - Math.floor(deg)) * 60);
  return { sign: SIGNS[i], deg: Math.floor(deg), min: m };
}

type Props = {
  chartData: ChartData | null;
  chartType: "D1" | "D3" | "D9" | "CAL";
  selectedPlanet: string | null;
  onSelectPlanet: (name: string | null) => void;
};

export function RightPanel({ chartData, chartType, selectedPlanet, onSelectPlanet }: Props) {
  const [tab, setTab] = useState<Tab>("ตำแหน่งดาว");
  
  // Use real dasha timeline if available, otherwise empty
  const dashaTimeline = chartData?.dasha_timeline || [];
  
  const planetThaiNames: { [key: string]: string } = {
      Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
      Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ"
  };

  const planetColors: { [key: string]: string } = {
      Sun: "var(--warning)", Moon: "#cfd6e4", Mars: "var(--destructive)",
      Jupiter: "var(--primary)", Venus: "#f5b8e0", Mercury: "var(--info)",
      Saturn: "#94a3b8", Rahu: "var(--accent)", Ketu: "var(--accent)"
  };

  const getThaiNak = (index: number) => {
    return THAI_NAKSHATRAS.find(n => n.id === index);
  };

  const getDignityStyle = (dignity: string) => {
    if (dignity.includes("มหาอุจจ์")) return "bg-primary text-primary-foreground font-bold shadow-[0_0_8px_oklch(var(--primary)/0.4)]";
    if (dignity.includes("อุจจ์")) return "bg-primary/20 text-primary border border-primary/30";
    if (dignity.includes("เกษตร")) return "bg-success/20 text-success border border-success/30";
    if (dignity.includes("มหาจักร")) return "bg-accent/20 text-accent border border-accent/30";
    if (dignity.includes("ราชาโชค") || dignity.includes("เทวีโชค")) return "bg-warning/20 text-warning border border-warning/30";
    if (dignity.includes("วรโคตม")) return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
    if (dignity.includes("พักร์") || dignity.includes("ดับ")) return "bg-destructive/20 text-destructive border border-destructive/30";
    if (dignity.includes("ประ") || dignity.includes("นิจ")) return "bg-destructive/10 text-destructive/70 border border-destructive/20";
    return "bg-muted/50 text-muted-foreground border border-border/50";
  };

  const planets = chartData ? Object.entries(chartData.planets).map(([name, p]) => {
    const naks = chartData.lunar_data?.planet_nakshatras?.[name];
    const thaiNak = naks ? getThaiNak(naks.index) : null;
    
    // Status list aggregation
    let allStatuses = [...(p.dignity_list || (p.dignity ? [p.dignity] : []))];
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
      house: p.house || "?",
      dignity: p.dignity || "ปกติ",
      dignityList: allStatuses,
      nakshatra: thaiNak ? `${thaiNak.name} (${naks.pada})` : "—",
      nakCategory: thaiNak ? `${thaiNak.category}ฤกษ์` : "",
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
        {(["ตำแหน่งดาว", "กำลังดาว", "เกณฑ์พิเศษ"] as Tab[]).map((t) => (
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
            {tab === "ตำแหน่งดาว" && (
              <table className="w-full border-collapse text-[10px] font-mono">
                <thead className="sticky top-0 bg-card/95 backdrop-blur">
                  <tr className="text-left text-[9px] uppercase tracking-wider text-muted-foreground">
                    <th className="border-b border-border px-2 py-1.5 font-semibold">ดาว</th>
                    <th className="border-b border-border px-2 py-1.5 font-semibold">องศา/ราศี</th>
                    <th className="border-b border-border px-2 py-1.5 font-semibold">นพเคราะห์/ภพ</th>
                    <th className="border-b border-border px-2 py-1.5 font-semibold">มาตรฐาน</th>
                  </tr>
                </thead>
                <tbody>
                  {lagna && (
                    <tr className="border-b border-border bg-primary/5">
                      <td className="px-2 py-1.5">
                        <span className="mr-1.5 font-bold" style={{ color: lagna.color }}>{lagna.symbol}</span>
                        <span className="text-foreground font-bold">{lagna.name}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        {(() => {
                          const d = degToSign(lagna.lon);
                          return (
                            <>
                              <div className="text-foreground font-bold">{d.deg}°{String(d.min).padStart(2, "0")}′</div>
                              <div className="text-[9px] text-muted-foreground">{d.sign.symbol} {d.sign.name_th}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="text-foreground">{lagna.nakshatra}</div>
                        <div className="text-[10px] text-primary/80 font-bold">{lagna.nakCategory}</div>
                      </td>
                      <td className="px-2 py-1.5">—</td>
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
                        <td className="px-2 py-1.5">
                          <span className="mr-1.5 font-bold" style={{ color: p.color }}>{p.symbol}</span>
                          <span className="text-foreground font-bold">{p.name}</span>
                          {p.retro && <span className="ml-1 text-destructive">℞</span>}
                        </td>
                        <td className="px-2 py-1.5">
                            <div className="text-foreground font-bold">{d.deg}°{String(d.min).padStart(2, "0")}′</div>
                            <div className="text-[9px] text-muted-foreground">{d.sign.symbol} {d.sign.name_th}</div>
                        </td>
                        <td className="px-2 py-1.5">
                            <div className="text-foreground">{p.nakshatra}</div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                <span className="text-[10px] text-accent/80 font-bold whitespace-nowrap">{p.nakCategory}</span>
                                <span className="text-[9px] text-muted-foreground italic whitespace-nowrap">ภพที่ {p.house}</span>
                            </div>
                        </td>
                        <td className="px-2 py-1.5">
                          {chartType === "CAL" ? (
                             <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[9px] transition-all ${getDignityStyle(p.dignity)}`}>
                                {p.dignityList.join(" ")}
                             </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                                {p.dignityList.map(s => (
                                    <span key={s} className={`inline-flex items-center justify-center rounded px-1 py-0.5 text-[8px] leading-none transition-all whitespace-nowrap ${getDignityStyle(s)}`}>
                                        {s}
                                    </span>
                                ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {tab === "กำลังดาว" && (
              <div className="p-4 space-y-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">Divisional Charts (D3 / D9)</div>
                <div className="grid grid-cols-1 gap-4">
                  {/* D9 Section */}
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[10px] font-bold text-accent border-l-2 border-accent pl-2 mb-1 uppercase tracking-wider">นวางค์จักร (Navamsa - D9)</div>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(chartData.d9).map(([name, p]: [string, any]) => {
                         const d = degToSign(p.longitude);
                         const dignity = p.dignity || "ปกติ";
                         return (
                            <div key={name} className="flex items-center justify-between text-[10px] font-mono bg-muted/20 px-2 py-1.5 rounded border border-border/40">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold" style={{ color: planetColors[name] || "var(--accent)" }}>{planetThaiNames[name] || name}</span>
                                    <span className="text-[9px] text-muted-foreground">{d.sign.symbol}</span>
                                </div>
                                <div className="flex gap-1">
                                    {(Array.isArray(p.dignity_list) ? p.dignity_list : [dignity]).map((s: string) => (
                                        <span key={s} className={`px-1 rounded-[2px] text-[8px] ${getDignityStyle(s)}`}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                         );
                      })}
                    </div>
                  </div>

                  {/* D3 Section */}
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[10px] font-bold text-primary border-l-2 border-primary pl-2 mb-1 uppercase tracking-wider">ตรียางค์จักร (Drekkana - D3)</div>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(chartData.d3).map(([name, p]: [string, any]) => {
                         const d = degToSign(p.longitude);
                         const dignity = p.dignity || "ปกติ";
                         return (
                            <div key={name} className="flex items-center justify-between text-[10px] font-mono bg-muted/20 px-2 py-1.5 rounded border border-border/40">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold" style={{ color: planetColors[name] || "var(--accent)" }}>{planetThaiNames[name] || name}</span>
                                    <span className="text-[9px] text-muted-foreground">{d.sign.symbol}</span>
                                </div>
                                <div className="flex gap-1">
                                    {(Array.isArray(p.dignity_list) ? p.dignity_list : [dignity]).map((s: string) => (
                                        <span key={s} className={`px-1 rounded-[2px] text-[8px] ${getDignityStyle(s)}`}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground italic text-center py-4">
                    กำลังดาว (Shadbala) กำลังถูกคำนวณ...
                </div>
              </div>
            )}

            {tab === "เกณฑ์พิเศษ" && (
              <div className="p-3 text-center py-10 text-muted-foreground/60 italic text-[10px]">
                การวิเคราะห์โยคและเกณฑ์พิเศษ กำลังพัฒนาใน Layer 2
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