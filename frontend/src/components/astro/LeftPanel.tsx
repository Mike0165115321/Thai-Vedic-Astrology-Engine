"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Clock, Loader2 } from "lucide-react";
import { RECENT_CHARTS } from "./data";
import { BirthFormData } from "@/types/chart";

type Mode = "Natal" | "Synastry" | "Transit";

type Props = {
  mode: Mode;
  setMode: (m: Mode) => void;
  onCalculate: (data: BirthFormData) => void;
  loading: boolean;
};

export function LeftPanel({ mode, setMode, onCalculate, loading }: Props) {
  const [openForm, setOpenForm] = useState(true);
  const [formData, setFormData] = useState<BirthFormData>({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    lat: 13.7367,
    lon: 100.5231
  });

  const handleInputChange = (key: keyof BirthFormData, val: string) => {
    setFormData(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  return (
    <aside className="flex flex-col gap-3 border-r border-border bg-card/40 p-3 overflow-y-auto">
      <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-muted/40 p-1">
        {(["Natal", "Synastry", "Transit"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-[10px] uppercase tracking-wider py-1.5 rounded-sm transition ${
              mode === m ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <button
          onClick={() => setOpenForm((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          <span>Birth Data Terminal</span>
          {openForm ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {openForm && (
          <div className="space-y-3 border-t border-border p-3 text-xs">
             <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Day</label>
                    <input type="number" value={formData.day} onChange={e => handleInputChange("day", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Month</label>
                    <input type="number" value={formData.month} onChange={e => handleInputChange("month", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Year</label>
                    <input type="number" value={formData.year} onChange={e => handleInputChange("year", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Hour</label>
                    <input type="number" value={formData.hour} onChange={e => handleInputChange("hour", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Minute</label>
                    <input type="number" value={formData.minute} onChange={e => handleInputChange("minute", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Latitude</label>
                    <input type="number" step="any" value={formData.lat} onChange={e => handleInputChange("lat", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-muted-foreground">Longitude</label>
                    <input type="number" step="any" value={formData.lon} onChange={e => handleInputChange("lon", e.target.value)} className="w-full bg-input/50 border border-border rounded px-2 py-1 font-mono text-xs" />
                </div>
             </div>

            <button 
                onClick={() => onCalculate(formData)}
                disabled={loading}
                className="mt-2 w-full rounded bg-primary py-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              {loading ? "Computing..." : "Execute Calculation"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-md border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Archives</span>
          <button className="text-primary hover:opacity-80"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        <ul className="divide-y divide-border border-t border-border overflow-y-auto">
          {RECENT_CHARTS.map((c, i) => (
            <li key={c.name} className={`cursor-pointer px-3 py-2 text-[10px] hover:bg-muted/40 transition-colors ${i === 0 ? "bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{c.name}</span>
                {i === 0 && <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 text-[8px] font-bold text-primary">LIVE</span>}
              </div>
              <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">{c.date} · {c.loc}</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}