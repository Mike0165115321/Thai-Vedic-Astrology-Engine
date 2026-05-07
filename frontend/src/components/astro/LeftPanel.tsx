"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Clock, Loader2, Trash2 } from "lucide-react";
import { BirthFormData } from "@/types/chart";
import { LocationSearch } from "./LocationSearch";

type Mode = "Natal" | "Synastry" | "Transit";

export interface HistoryItem {
    id: string;
    name: string;
    date: string;
    loc: string;
    formData: BirthFormData;
}

type Props = {
  mode: Mode;
  setMode: (m: Mode) => void;
  onCalculate: (data: BirthFormData) => void;
  loading: boolean;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
};

export function LeftPanel({ mode, setMode, onCalculate, loading, history, onSelectHistory, onDeleteHistory }: Props) {
  const [openForm, setOpenForm] = useState(true);
  const [formData, setFormData] = useState<BirthFormData>({
    name: "",
    year: 2024,
    month: 5,
    day: 7,
    hour: 12,
    minute: 0,
    lat: 13.7563,
    lon: 100.5018,
    timezone: "Asia/Bangkok",
    ayanamsa_mode: "LAHIRI",
    custom_ayanamsa_offset: 0
  });

  // Load last session form data
  useEffect(() => {
      const saved = localStorage.getItem("last_form_data");
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              setFormData(parsed);
          } catch (e) {}
      }
  }, []);

  // Save as user types
  useEffect(() => {
      localStorage.setItem("last_form_data", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (key: keyof BirthFormData, val: string) => {
    // List of fields that should be numeric
    const numericFields: (keyof BirthFormData)[] = ["year", "month", "day", "hour", "minute", "lat", "lon"];
    
    if (numericFields.includes(key)) {
        const numVal = val === "" ? 0 : parseFloat(val);
        setFormData((prev) => ({ ...prev, [key]: numVal }));
    } else {
        setFormData((prev) => ({ ...prev, [key]: val }));
    }
  };

  const AYANAMSAS = [
    { value: "LAHIRI", label: "Lahiri (สากล)" },
    { value: "SURYASIDDHANTA", label: "Suryasiddhanta (ไทย)" },
    { value: "RAMAN", label: "Raman" },
    { value: "KRISHNAMURTI", label: "Krishnamurti" },
    { value: "CUSTOM", label: "Custom Offset" },
  ];

  return (
    <aside className="flex flex-col gap-3 border-r border-border bg-card/40 p-3 overflow-y-auto">
      <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-muted/40 p-1">
        {(["Natal", "Synastry", "Transit"] as Mode[]).map((m) => {
          const labels = { Natal: "ดวงกำเนิด", Synastry: "ดวงสมพงษ์", Transit: "ดวงจร" };
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-sm transition ${
                mode === m ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[m]}
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <button
          onClick={() => setOpenForm((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20"
        >
          <span>กรอกข้อมูลชะตา</span>
          {openForm ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {openForm && (
          <div className="space-y-3.5 border-t border-border p-3.5 text-[13px]">
             <div>
                <label className="text-[10px] font-bold uppercase text-primary/80 mb-1 block">ชื่อ-นามสกุล / หัวข้อดวง</label>
                <input 
                    type="text" 
                    placeholder="ระบุชื่อเจ้าชะตา..." 
                    value={formData.name} 
                    onChange={e => handleInputChange("name", e.target.value)} 
                    className="w-full bg-input border border-border rounded px-2.5 py-1.5 text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all" 
                />
             </div>
             <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">วันที่</label>
                    <input type="number" value={formData.day} onChange={e => handleInputChange("day", e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">เดือน</label>
                    <input type="number" value={formData.month} onChange={e => handleInputChange("month", e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">ปี (พ.ศ.)</label>
                    <input 
                        type="number" 
                        value={formData.year + 543} 
                        onChange={e => handleInputChange("year", (parseInt(e.target.value) - 543).toString())} 
                        className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" 
                    />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">ชั่วโมง</label>
                    <input type="number" value={formData.hour} onChange={e => handleInputChange("hour", e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">นาที</label>
                    <input type="number" value={formData.minute} onChange={e => handleInputChange("minute", e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" />
                </div>
             </div>

             <LocationSearch 
                onSelect={(lat, lon, name) => {
                    setFormData((prev: any) => ({ ...prev, lat, lon }));
                }} 
             />

             <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">ละติจูด (Lat)</label>
                    <input type="number" step="any" value={formData.lat} onChange={e => handleInputChange("lat", e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" />
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">ลองจิจูด (Lon)</label>
                    <input type="number" step="any" value={formData.lon} onChange={e => handleInputChange("lon", e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 font-mono text-[13px]" />
                </div>
             </div>

             <div className="pt-2 border-t border-border/50">
                <label className="text-[10px] font-bold uppercase text-primary/80 mb-1 block">ระบบอายนางศ (Ayanamsa)</label>
                <select 
                    value={formData.ayanamsa_mode || "LAHIRI"} 
                    onChange={e => handleInputChange("ayanamsa_mode", e.target.value)}
                    className="w-full bg-input border border-border rounded px-2 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                    {AYANAMSAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
             </div>

             {formData.ayanamsa_mode === "CUSTOM" && (
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Custom Offset (องศา)</label>
                    <input 
                        type="number" 
                        step="any" 
                        value={formData.custom_ayanamsa_offset || 0} 
                        onChange={e => handleInputChange("custom_ayanamsa_offset", e.target.value)} 
                        className="w-full bg-input border border-border rounded px-2 py-1.5 font-mono text-[13px]" 
                    />
                </div>
             )}

            <button 
                onClick={() => {
                    onCalculate(formData);
                }}
                disabled={loading}
                className="mt-3 w-full rounded bg-primary py-2.5 text-[12px] font-black uppercase tracking-[0.15em] text-primary-foreground hover:brightness-110 shadow shadow-primary/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "กำลังคำนวณ..." : "คำนวณดวงชะตา"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-md border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> คลังข้อมูลดวง</span>
          <button className="text-primary hover:opacity-80 p-0.5"><Plus className="h-4 w-4" /></button>
        </div>
        <ul className="divide-y divide-border border-t border-border overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center text-[10px] text-muted-foreground/40 italic font-mono uppercase tracking-widest h-full">
              ไม่มีข้อมูลในคลัง
            </div>
          ) : (
            history.map((item, i) => (
              <li 
                key={item.id} 
                className="group relative cursor-pointer px-3 py-2 text-[12px] hover:bg-primary/10 transition-colors"
                onClick={() => {
                    setFormData(item.formData);
                    onSelectHistory(item);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{item.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{item.date} · {item.loc}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}