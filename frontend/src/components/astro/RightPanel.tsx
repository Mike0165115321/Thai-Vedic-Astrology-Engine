import { useState } from "react";
import { PLANETS, DASHA, SIGNS } from "./data";

type Tab = "Planets" | "Shadbala" | "Yogas";

function degToSign(lon: number) {
  const i = Math.floor(lon / 30);
  const deg = lon - i * 30;
  const m = Math.floor((deg - Math.floor(deg)) * 60);
  return { sign: SIGNS[i], deg: Math.floor(deg), min: m };
}

export function RightPanel() {
  const [tab, setTab] = useState<Tab>("Planets");
  const nowYear = new Date().getFullYear();
  const span = DASHA[DASHA.length - 1].end - DASHA[0].start;
  const nowPct = ((nowYear - DASHA[0].start) / span) * 100;

  return (
    <aside className="flex flex-col border-l border-border bg-card/40 overflow-hidden">
      <div className="flex border-b border-border bg-muted/30">
        {(["Planets", "Shadbala", "Yogas"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "Planets" && (
          <table className="w-full border-collapse text-[11px] font-mono">
            <thead className="sticky top-0 bg-card/95 backdrop-blur">
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                {["Planet", "Lon", "Sign", "H", "Dignity", "Nakshatra"].map((h) => (
                  <th key={h} className="border-b border-border px-2 py-1.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLANETS.map((p) => {
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
                    <td className="px-2 py-1.5 text-muted-foreground">{p.house}</td>
                    <td className="px-2 py-1.5">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] ${
                        p.dignity === "Exalted" ? "bg-success/20 text-[color:var(--success)]" :
                        p.dignity === "Debilitated" ? "bg-destructive/20 text-destructive" :
                        p.dignity === "Own" ? "bg-primary/20 text-primary" :
                        "bg-muted text-muted-foreground"}`}>
                        {p.dignity}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{p.nakshatra}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === "Shadbala" && (
          <div className="space-y-2 p-3">
            {PLANETS.slice(0, 7).map((p) => {
              const total = 60 + ((p.lon * 7) % 120);
              return (
                <div key={p.name} className="text-xs">
                  <div className="mb-1 flex justify-between font-mono">
                    <span style={{ color: p.color }}>{p.symbol} {p.name}</span>
                    <span className="text-muted-foreground">{total.toFixed(1)} virupa</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${(total / 180) * 100}%`, background: p.color }} />
                  </div>
                  <div className="mt-1 grid grid-cols-6 gap-1 font-mono text-[9px] text-muted-foreground">
                    {["Sthana", "Dig", "Kala", "Cesta", "Naisar", "Drik"].map((s) => (
                      <span key={s} className="text-center">{s}<br /><span className="text-foreground">{(Math.random()*30+5).toFixed(0)}</span></span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Yogas" && (
          <ul className="divide-y divide-border text-xs">
            {[
              { n: "Gaja-Kesari", d: "Jupiter ↔ Moon in kendra", s: "Auspicious" },
              { n: "Budhaditya", d: "Sun + Mercury conjunction", s: "Intellectual" },
              { n: "Neecha-Bhanga", d: "Mars debilitation cancelled", s: "Strong" },
              { n: "Vipreet Raja", d: "6L in 8H exchange", s: "Hidden gain" },
              { n: "Chandra-Mangala", d: "Moon + Mars 7°", s: "Wealth" },
            ].map((y) => (
              <li key={y.n} className="px-3 py-2 hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{y.n}</span>
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] text-accent-foreground">{y.s}</span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{y.d}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dasha Gantt */}
      <div className="border-t border-border bg-card/60 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Vimshottari Dasha</span>
          <span className="font-mono text-primary">NOW · {nowYear}</span>
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
        <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
          <span>{DASHA[0].start}</span>
          <span>{Math.round((DASHA[0].start + DASHA[DASHA.length-1].end)/2)}</span>
          <span>{DASHA[DASHA.length-1].end}</span>
        </div>
      </div>
    </aside>
  );
}