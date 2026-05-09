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
  const now = new Date();
  const currentYearBE = now.getFullYear() + 543;
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [startYear, setStartYear] = useState(currentYearBE);
  const [endMonth, setEndMonth] = useState(12);
  const [endYear, setEndYear] = useState(currentYearBE + 10);
  const [loading, setLoading] = useState(false);
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([
    "Jupiter", "Saturn", "Rahu", "Uranus"
  ]);

  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

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
      natal_data: birthData,
      start_year: startYear - 543,
      start_month: startMonth,
      start_day: 1,
      end_year: endYear - 543,
      end_month: endMonth,
      end_day: 28,
      planets: selectedPlanets
    });
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">ระบบวิเคราะห์ดาวจรเชิงลึก</h2>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Advanced Transit Scanner (พ.ศ.)</p>
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

          {/* Step 2: Time Range (Month/Year for both) */}
          <div className="space-y-4">
            <div className="bg-muted/20 p-4 rounded-2xl border border-border/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">เดือนเริ่มต้น</label>
                  <select 
                    value={startMonth}
                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all"
                  >
                    {months.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">ปี พ.ศ. เริ่มต้น</label>
                  <input 
                    type="number" 
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value) || currentYearBE)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center py-1">
                <div className="h-px bg-border flex-1"></div>
                <span className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">ถึง</span>
                <div className="h-px bg-border flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">เดือนสิ้นสุด</label>
                  <select 
                    value={endMonth}
                    onChange={(e) => setEndMonth(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all"
                  >
                    {months.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">ปี พ.ศ. สิ้นสุด</label>
                  <input 
                    type="number" 
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value) || currentYearBE + 10)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {(() => {
            const getBirthYear = () => {
              if (selectedPersonId === "current") return currentNatalData?.year || new Date().getFullYear();
              return history.find(p => p.id === selectedPersonId)?.formData.year || new Date().getFullYear();
            };
            const bYear = getBirthYear() + 543;
            const sAge = startYear - bYear;
            const eAge = endYear - bYear;
            return (
              <div className="mt-[-12px] px-2">
                <p className="text-xs font-bold text-primary">
                  ✨ วิเคราะห์ช่วงอายุประมาณ {sAge} - {eAge} ปี
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  * ข้อมูลจะถูกสแกนตั้งแต่เดือนเริ่มต้นที่เลือก ไปจนถึงสิ้นเดือนของปีและเดือนที่สิ้นสุด
                </p>
              </div>
            );
          })()}

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
            <Info className="h-4 w-4 shrink-0 text-blue-400" />
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
            className="flex-2 rounded-xl bg-(image:--gradient-gold) px-4 py-3 text-sm font-bold text-primary-foreground shadow-(--shadow-glow) hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-wait"
          >
            {loading ? "กำลังวิเคราะห์จักรวาล..." : "เริ่มการวิเคราะห์และดาวน์โหลด JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}
