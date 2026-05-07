import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-105"
        >
          <Sparkles className="h-4 w-4" /> ผู้ช่วย AI
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[480px] w-[380px] flex-col rounded-lg border border-border bg-card shadow-[var(--shadow-panel)]">
          <div className="flex items-center justify-between border-b border-border bg-[image:var(--gradient-cosmic)] px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> ระบบวิเคราะห์ AI
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs">
            <Bubble role="ai">
              I see Mars is debilitated in Cancer (7H) for Aria. Combined with Saturn's transit
              over the natal Moon, this period highlights tension in partnerships. Want me to
              dive deeper into the current Venus dasha sub-period?
            </Bubble>
            <Bubble role="user">Yes, summarize the next 6 months.</Bubble>
            <Bubble role="ai">
              Venus → Mercury (until 2026-09-12): expect intellectual collaborations,
              short-distance travel, and contractual gains. Caution Sept 4–18: Mars transits
              the 12H, prone to fatigue.
            </Bubble>
          </div>
          <div className="flex items-center gap-2 border-b border-border p-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">ผู้ช่วย AI โหราศาสตร์</span>
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input
              placeholder="สอบถามข้อมูลดาว หรือการทำนายดวงชะตา…"
              className="flex-1 rounded border border-border bg-input/60 px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
            />
            <button className="rounded bg-primary px-2.5 text-primary-foreground"><Send className="h-3.5 w-3.5" /></button>
          </div>
          <div className="border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
            บริบท: ข้อมูล Natal · Transit +0 วัน
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: "ai" | "user"; children: React.ReactNode }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
        role === "user" ? "bg-primary/15 text-foreground" : "border border-border bg-muted/40 text-foreground"
      }`}>{children}</div>
    </div>
  );
}