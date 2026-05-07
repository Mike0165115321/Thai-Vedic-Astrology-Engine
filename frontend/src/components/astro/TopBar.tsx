import { Download, Settings, FileJson, MapPin, Calendar, User, Activity } from "lucide-react";

export function TopBar({ onSettings }: { onSettings: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card/70 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[image:var(--gradient-gold)] text-base font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
          ✦
        </div>
        <div className="leading-tight">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Astro Terminal</div>
          <div className="font-mono text-xs text-foreground">v2.4.1 · Lahiri · Whole Sign</div>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
        <Field icon={<User className="h-3 w-3" />} label="Subject" value="Aria Volkov" />
        <Field icon={<Calendar className="h-3 w-3" />} label="Born" value="1992-04-17 · 04:32" />
        <Field icon={<MapPin className="h-3 w-3" />} label="Location" value="Reykjavik, IS · 64.13°N" />
        <Field icon={<Activity className="h-3 w-3 text-success" />} label="Engine" value={<span className="text-success">LIVE</span>} />
      </div>

      <div className="flex items-center gap-1.5">
        <button className="flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2.5 py-1.5 text-xs hover:bg-muted">
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
        <button className="flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2.5 py-1.5 text-xs hover:bg-muted">
          <FileJson className="h-3.5 w-3.5" /> JSON
        </button>
        <button onClick={onSettings} className="rounded border border-border bg-muted/40 p-1.5 hover:bg-muted">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="text-muted-foreground">{icon}</div>
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-foreground">{value}</div>
      </div>
    </div>
  );
}