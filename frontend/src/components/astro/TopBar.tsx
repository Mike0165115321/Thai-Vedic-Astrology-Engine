import { Download, Settings } from "lucide-react";

export function TopBar({ 
  onSettings, 
  onExportNatal,
  onTransitScan,
  currentChartType, 
  onChartTypeChange 
}: { 
  onSettings: () => void,
  onExportNatal?: () => void,
  onTransitScan?: () => void,
  currentChartType: string,
  onChartTypeChange: (type: 'D1' | 'D3' | 'D9' | 'CAL') => void
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card/70 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-(image:--gradient-gold) font-bold text-primary-foreground shadow-(--shadow-glow)">
          A
        </div>
        <span className="text-sm font-bold tracking-widest text-foreground">
          AETOX <span className="text-primary">ASTRO</span>
        </span>
        <span className="ml-2 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          v1.0-เบต้า
        </span>
      </div>

      <nav className="hidden items-center gap-6 md:flex">
        {[
          { id: "D1", n: "ราศีจักร (D1)" },
          { id: "D3", n: "ตรียางค์ (D3)" },
          { id: "D9", n: "นวางศ์จักร (D9)" },
          { id: "CAL", n: "ปฏิทินดาว" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onChartTypeChange?.(item.id as any)}
            className={`text-[11px] font-medium uppercase tracking-wider transition ${
              currentChartType === item.id ? "text-primary border-b-2 border-primary pb-0.5" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.n}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
        <button 
          onClick={onExportNatal}
          className="flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2.5 py-1.5 text-xs hover:bg-muted text-primary font-bold"
        >
          <Download className="h-3.5 w-3.5" /> ส่งออกข้อมูล (Export)
        </button>
        <button 
          onClick={onTransitScan}
          className="flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2.5 py-1.5 text-xs hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" /> สแกนดาวจร (Timeline)
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