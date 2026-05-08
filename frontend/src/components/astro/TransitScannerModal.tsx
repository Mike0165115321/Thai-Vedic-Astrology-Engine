import React, { useState } from "react";
import { X, Calendar, User, Download, Info, Check } from "lucide-react";
import { BirthFormData, ChartData } from "@/types/chart";
import { HistoryItem } from "./LeftPanel";

interface TransitScannerModalProps {
  onClose: () => void;
  history: HistoryItem[];
  currentNatalData: BirthFormData | null;
  onGenerate: (config: any) => Promise<void>;
}

export function TransitScannerModal({ onClose, history, currentNatalData, onGenerate }: TransitScannerModalProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>("current");
  const [startAge, setStartAge] = useState(0);
  const [endAge, setEndAge] = useState(100);
  const [loading, setLoading] = useState(false);
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([
    "Jupiter", "Saturn", "Rahu", "Uranus"
  ]);

  const planetsList = [
    { id: "Sun", name: "อาทิตย์ (๑)" },
    { id: "Moon", name: "จันทร์ (๒)" },
    { id: "Mars", name: "อังคาร (๓)" },
    { id: "Mercury", name: "พุธ (๔)" },
    { id: "Jupiter", name: "พฤหัสบดี (๕)" },
    { id: "Venus", name: "ศุกร์ (๖)" },
    { id: "Saturn", name: "เสาร์ (๗)" },
    { id: "Rahu", name: "ราหู (๘)" },
    { id: "Ketu", name: "เกตุ (๙)" },
    { id: "Uranus", name: "มฤตยู (๐)" },
  ];

  const handleTogglePlanet = (id: string) => {
    setSelectedPlanets(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleRun = async () => {
    setLoading(true);
    
    // Find the actual birth data
    let birthData: BirthFormData | null = null;
    if (selectedPersonId === "current") {
      birthData = currentNatalData;
    } else {
      const person = history.find(h => h.id === selectedPersonId);
      if (person) birthData = person.formData;
    }

    if (!birthData) {
      alert("กรุณาเลือกข้อมูลบุคคล");
      setLoading(false);
      return;
    }

    await onGenerate({
      birthData,
      startAge,
      endAge,
      planets: selectedPlanets
    });
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Advanced Transit Scanner</h2>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ระบบวิเคราะห์ดาวจรเชิงลึก (120 ปี)</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Person */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-primary" /> เลือกข้อมูลบุคคล
            </label>
            <select 
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all"
            >
              <option value="current">คนปัจจุบัน (จากหน้าจอ)</option>
              {history.map(item => (
                <option key={item.id} value={item.id}>{item.name} ({item.date})</option>
              ))}
            </select>
          </div>

          {/* Step 2: Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-primary" /> ช่วงอายุ
              </label>
              <input 
                type="number" 
                value={startAge}
                min={0}
                max={120}
                onChange={(e) => setStartAge(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-primary" /> ถึง
              </label>
              <input 
                type="number" 
                value={endAge}
                min={0}
                max={120}
                onChange={(e) => setEndAge(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <p className="text-[10px] text-muted-foreground px-1 italic">
                * สแกนได้สูงสุด 120 ปี ต่อการวิเคราะห์ 1 ครั้ง
              </p>
            </div>
          </div>

          {/* Step 3: Planets */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>ดาวที่ต้องการสแกน</span>
              <span className="text-[10px] text-muted-foreground">{selectedPlanets.length} ดวงที่เลือก</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {planetsList.map(planet => (
                <button
                  key={planet.id}
                  onClick={() => handleTogglePlanet(planet.id)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                    selectedPlanets.includes(planet.id) 
                      ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]" 
                      : "border-border bg-muted/20 text-muted-foreground hover:border-border-hover hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs font-bold">{planet.name.split(" ")[1]}</span>
                  <span className="text-[9px] uppercase tracking-tighter opacity-70">{planet.id}</span>
                  {selectedPlanets.includes(planet.id) && (
                    <div className="absolute top-1 right-1">
                      <Check className="h-2 w-2" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-[11px] text-blue-200/70 flex gap-3">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-400" />
            <p>ระบบจะสแกนหาเหตุการณ์ "ดาวเปลี่ยนราศี" และ "การเปลี่ยนทิศทางการเดิน" พร้อมวิเคราะห์มุมสัมพันธ์กับดวงเดิมโดยละเอียดตลอดช่วงอายุที่เลือก</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 bg-muted/30 p-6 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleRun}
            disabled={loading}
            className="flex-[2] rounded-xl bg-(image:--gradient-gold) px-4 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-wait"
          >
            {loading ? "กำลังวิเคราะห์จักรวาล..." : "เริ่มการวิเคราะห์และดาวน์โหลด JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}
