import { X } from "lucide-react";
import { BirthFormData } from "@/types/chart";

interface SettingsModalProps {
  onClose: () => void;
  settings: Partial<BirthFormData>;
  onUpdate: (settings: Partial<BirthFormData>) => void;
}

export function SettingsModal({ onClose, settings, onUpdate }: SettingsModalProps) {
  const ayanamsa = settings.ayanamsa_mode || "LAHIRI";
  const houseSystem = settings.house_system || "Whole Sign";
  const nodeType = settings.node_type || "TRUE";
  const aspectOrb = settings.aspect_orb?.toString() || "5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-panel)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">ตั้งค่าการคำนวณ</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 text-xs">
          <Section 
            title="ปฏิทินอายนางศ (Ayanamsa)" 
            options={["LAHIRI", "RAMAN", "KRISHNAMURTI", "FAGAN_BRADLEY", "TROPICAL"]} 
            active={ayanamsa} 
            onChange={(val) => onUpdate({ ayanamsa_mode: val })}
          />
          <Section 
            title="ระบบเรือนชะตา (House System)" 
            options={["Whole Sign", "Placidus", "Koch", "Equal", "Porphyry"]} 
            active={houseSystem} 
            onChange={(val) => onUpdate({ house_system: val })}
          />
          <Section 
            title="การคำนวณราหู/เกตุ (Node)" 
            options={["MEAN", "TRUE"]} 
            active={nodeType} 
            onChange={(val) => onUpdate({ node_type: val as "MEAN" | "TRUE" })}
            labels={{ "MEAN": "เฉลี่ย (Mean)", "TRUE": "จริง (True)" }}
          />
          <Section 
            title="ระยะเอื้อมมุมสัมพันธ์ (Aspect Orb °)" 
            options={["3", "5", "8", "10"]} 
            active={aspectOrb} 
            onChange={(val) => onUpdate({ aspect_orb: parseInt(val) })}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, options, active, onChange, labels }: { 
  title: string; 
  options: string[]; 
  active: string;
  onChange: (val: string) => void;
  labels?: { [key: string]: string };
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button 
            key={o} 
            onClick={() => onChange(o)}
            className={`rounded border px-2 py-1 transition-colors ${
              o === active ? "border-primary bg-primary/15 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {labels?.[o] || o.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}