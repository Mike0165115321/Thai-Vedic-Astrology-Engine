"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Filter } from "lucide-react";
import { ZodiacWheel } from "./ZodiacWheel";
import { ASPECTS } from "./data";
import { ChartData } from "@/types/chart";

type Props = {
  chartData: ChartData | null;
  loading: boolean;
};

export function CenterPanel({ chartData, loading }: Props) {
  const [offset, setOffset] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState<string[]>(ASPECTS.map((a) => a.type));

  const toggle = (t: string) =>
    setEnabled((e) => (e.includes(t) ? e.filter((x) => x !== t) : [...e, t]));

  return (
    <section className="flex flex-col bg-[image:var(--gradient-cosmic)] relative">
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

      {/* Wheel */}
      <div className="relative flex flex-1 items-center justify-center p-4">
        <div className="aspect-square h-full max-h-[calc(100vh-220px)] w-auto">
          <ZodiacWheel 
            planets={chartData?.planets || null} 
            lagna={chartData?.lagna || null}
            transitOffset={offset} 
            enabledAspects={enabled} 
          />
        </div>

        {chartData && (
          <>
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-border bg-card/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
              JD · {chartData.julian_date.toFixed(4)}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 rounded border border-border bg-card/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
              ASC · {chartData.lagna.longitude.toFixed(2)}°
            </div>
          </>
        )}

        {!chartData && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 italic font-mono uppercase tracking-widest text-center px-10">
            ระบบพร้อมทำงาน กรุณากรอกข้อมูลเพื่อคำนวณตำแหน่งดาว
          </div>
        )}
      </div>

      {/* Transit scrubber */}
      <div className="border-t border-border bg-card/60 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button className="rounded border border-border bg-muted/40 p-1 hover:bg-muted"><SkipBack className="h-3.5 w-3.5" /></button>
            <button onClick={() => setPlaying((p) => !p)} className="rounded border border-primary/50 bg-primary/10 p-1 text-primary hover:bg-primary/20">
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button className="rounded border border-border bg-muted/40 p-1 hover:bg-muted"><SkipForward className="h-3.5 w-3.5" /></button>
          </div>
          <div className="font-mono text-xs text-foreground">
            <span className="text-muted-foreground">การโคจร (TRANSIT) · </span>
            {new Date(Date.now() + offset * 24 * 3600 * 1000).toISOString().slice(0, 10)}
            <span className="ml-2 text-primary">+{offset.toFixed(0)} วัน</span>
          </div>
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            {["1 ชม.", "1 วัน", "1 สัป.", "1 ด.", "1 ปี"].map((s) => (
              <button key={s} className="rounded border border-border px-1.5 py-0.5 hover:text-foreground">{s}</button>
            ))}
          </div>
        </div>
        <input
          type="range" min={-365} max={365} step={1}
          value={offset}
          onChange={(e) => setOffset(parseFloat(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
          <span>−1 ปี</span><span>−6 เดือน</span><span className="text-primary">ปัจจุบัน</span><span>+6 เดือน</span><span>+1 ปี</span>
        </div>
      </div>
    </section>
  );
}