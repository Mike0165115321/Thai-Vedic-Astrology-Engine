"use client";

import { useState } from "react";
import { SIGNS, DASHA } from "./data";
import { ChartData } from "@/types/chart";

type Tab = "ตำแหน่งดาว" | "กำลังดาว" | "เกณฑ์พิเศษ";

function degToSign(lon: number) {
  const i = Math.floor(lon / 30);
  const deg = lon - i * 30;
  const m = Math.floor((deg - Math.floor(deg)) * 60);
  return { sign: SIGNS[i], deg: Math.floor(deg), min: m };
}

type Props = {
  chartData: ChartData | null;
};

export function RightPanel({ chartData }: Props) {
  const [tab, setTab] = useState<Tab>("ตำแหน่งดาว");
  const nowYear = new Date().getFullYear();
  const span = DASHA[DASHA.length - 1].end - DASHA[0].start;
  const nowPct = ((nowYear - DASHA[0].start) / span) * 100;

  const planets = chartData ? Object.entries(chartData.planets).map(([name, p]) => {
    const planetThaiNames: { [key: string]: string } = {
        Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ",
        Jupiter: "พฤหัสบดี", Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ"
    };
    return {
    name: planetThaiNames[name] || name,
    symbol: p.symbol || name.substring(0, 2),
    lon: p.longitude,
    retro: p.is_retrograde,
    house: "?", // Backend should provide house
    dignity: "ปกติ", // Backend should provide dignity
    nakshatra: "—", // Backend should provide nakshatra
    color: name === "Sun" ? "var(--warning)" : 
           name === "Moon" ? "#cfd6e4" : 
           name === "Mars" ? "var(--destructive)" :
           name === "Jupiter" ? "var(--primary)" :
           name === "Venus" ? "#f5b8e0" :
           name === "Mercury" ? "var(--info)" :
           name === "Saturn" ? "#94a3b8" :
           "var(--accent)"
  }}) : [];

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
              <table className="w-full border-collapse text-[11px] font-mono">
                <thead className="sticky top-0 bg-card/95 backdrop-blur">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    {["ดาว", "องศา", "ราศี", "มาตรฐาน"].map((h) => (
                      <th key={h} className="border-b border-border px-2 py-1.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planets.map((p) => {
                    const d = degToSign(p.lon);
                    return (
                      <tr key={p.name} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-2 py-1.5">
                          <span className="mr-1.5" style={{ color: p.color }}>{p.symbol}</span>
                          <span className="text-foreground">{p.name}</span>
                          {p.retro && <span className="ml-1 text-destructive">℞</span>}
                        </td>
                        <td className="px-2 py-1.5 text-foreground">{d.deg}°{String(d.min).padStart(2, "0")}′</td>
                        <td className="px-2 py-1.5">{d.sign.symbol} {d.sign.name.slice(0,3)}</td>
                        <td className="px-2 py-1.5">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] ${
                            p.dignity === "Exalted" ? "bg-success/20 text-[color:var(--success)]" :
                            p.dignity === "Debilitated" ? "bg-destructive/20 text-destructive" :
                            p.dignity === "Own" ? "bg-primary/20 text-primary" :
                            "bg-muted text-muted-foreground"}`}>
                            {p.dignity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {tab === "กำลังดาว" && (
              <div className="space-y-2 p-3 text-center py-10 text-muted-foreground/60 italic text-[10px]">
                ระบบคำนวณกำลังดาว (Shadbala) กำลังพัฒนาใน Layer 2
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

      {/* Dasha Gantt (Mock for now, will connect to Layer 1G) */}
      <div className="border-t border-border bg-card/60 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>วิมโชตตรีทศา (Vimshottari Dasha)</span>
          <span className="font-mono text-primary">ปัจจุบัน · {nowYear}</span>
        </div>
        <div className="relative h-7 overflow-hidden rounded border border-border bg-muted/40">
          {DASHA.map((d) => {
            const left = ((d.start - DASHA[0].start) / span) * 100;
            const width = ((d.end - d.start) / span) * 100;
            return (
              <div key={d.lord}
                className="absolute top-0 flex h-full items-center justify-center border-r border-background/40 text-[9px] font-bold text-background"
                style={{ left: `${left}%`, width: `${width}%`, background: d.color }}
                title={`${d.lord} ${d.start}–${d.end}`}>
                {width > 6 ? d.lord : ""}
              </div>
            );
          })}
          <div className="absolute top-0 h-full w-px bg-primary shadow-[0_0_8px_var(--primary)]" style={{ left: `${nowPct}%` }}>
            <div className="absolute -top-1 -translate-x-1/2 rounded-sm bg-primary px-1 text-[8px] font-bold text-primary-foreground">▼</div>
          </div>
        </div>
      </div>
    </aside>
  );
}