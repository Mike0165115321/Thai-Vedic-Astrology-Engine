import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Clock } from "lucide-react";
import { RECENT_CHARTS } from "./data";

type Mode = "Natal" | "Synastry" | "Transit";

export function LeftPanel({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const [openForm, setOpenForm] = useState(true);
  return (
    <aside className="flex flex-col gap-3 border-r border-border bg-card/40 p-3 overflow-y-auto">
      <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-muted/40 p-1">
        {(["Natal", "Synastry", "Transit"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-xs uppercase tracking-wider py-1.5 rounded-sm transition ${
              mode === m ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card">
        <button
          onClick={() => setOpenForm((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          <span>Birth Input</span>
          {openForm ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {openForm && (
          <div className="space-y-2 border-t border-border p-3 text-xs">
            {[
              { l: "Full Name", v: "Aria Volkov" },
              { l: "Date", v: "1992-04-17" },
              { l: "Time", v: "04:32 (LMT)" },
              { l: "Location", v: "Reykjavik, Iceland" },
              { l: "Lat / Lon", v: "64.13°N / 21.94°W" },
              { l: "Timezone", v: "UTC+00:00" },
            ].map((f) => (
              <div key={f.l}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.l}</div>
                <input
                  defaultValue={f.v}
                  className="mt-0.5 w-full rounded border border-border bg-input/60 px-2 py-1 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            ))}
            <button className="mt-2 w-full rounded bg-[image:var(--gradient-gold)] py-1.5 text-xs font-semibold text-primary-foreground">
              Recalculate Chart
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-md border border-border bg-card">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Recent Charts</span>
          <button className="text-primary hover:opacity-80"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        <ul className="divide-y divide-border border-t border-border">
          {RECENT_CHARTS.map((c, i) => (
            <li key={c.name} className={`cursor-pointer px-3 py-2 text-xs hover:bg-muted/40 ${i === 0 ? "bg-muted/30" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{c.name}</span>
                {i === 0 && <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">ACTIVE</span>}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{c.date} · {c.loc}</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}