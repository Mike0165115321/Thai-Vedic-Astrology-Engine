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
  onCalculateCompare?: (dataA: BirthFormData, dataB: BirthFormData) => void;
  loading: boolean;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
};

export function LeftPanel({ mode, setMode, onCalculate, onCalculateCompare, loading, history, onSelectHistory, onDeleteHistory }: Props) {
  const [openForm, setOpenForm] = useState(true);
  
  const defaultFormData: BirthFormData = {
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
  };

  const [formData, setFormData] = useState<BirthFormData>(defaultFormData);
  const [formDataB, setFormDataB] = useState<BirthFormData>({ ...defaultFormData, name: "คนที่สอง" });

  useEffect(() => {
      const saved = localStorage.getItem("last_form_data");
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              setFormData(parsed);
          } catch (e) {}
      }
  }, []);

  useEffect(() => {
      localStorage.setItem("last_form_data", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (key: keyof BirthFormData, val: string, isB = false) => {
    const numericFields: (keyof BirthFormData)[] = ["year", "month", "day", "hour", "minute", "lat", "lon", "custom_ayanamsa_offset"];
    const setter = isB ? setFormDataB : setFormData;
    
    if (numericFields.includes(key)) {
        const numVal = val === "" ? 0 : parseFloat(val);
        setter((prev) => ({ ...prev, [key]: numVal }));
    } else {
        setter((prev) => ({ ...prev, [key]: val }));
    }
  };

  const AYANAMSAS = [
    { value: "LAHIRI", label: "ลาหิรี (สากล)" },
    { value: "SURYASIDDHANTA", label: "สุริยยาตร์ (ไทย)" },
    { value: "RAMAN", label: "รามัน" },
    { value: "KRISHNAMURTI", label: "กฤษณะมูรติ" },
    { value: "CUSTOM", label: "กำหนดค่าเอง" },
  ];

  return (
    <aside className="h-full flex flex-col gap-4 border-r border-border bg-card/40 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
      <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/30 p-1 shrink-0">
        {(["Natal", "Synastry"] as Mode[]).map((m) => {
          const labels = { Natal: "ดวงกำเนิด", Synastry: "ดวงสมพงษ์" };
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-[12px] font-bold py-2 rounded-md transition-all duration-300 ${
                mode === m ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {labels[m as keyof typeof labels]}
            </button>
          );
        })}
      </div>

      {/* ฟอร์มกรอกข้อมูล */}
      {mode !== "Transit" && (
        <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden shrink-0">
          <button
            onClick={() => setOpenForm(!openForm)}
            className="flex w-full items-center justify-between bg-muted/40 px-4 py-3.5 transition hover:bg-muted/60"
          >
            <div className="flex items-center gap-2.5">
              <Plus className={`h-4 w-4 text-primary transition-transform duration-500 ${openForm ? 'rotate-45' : ''}`} />
              <span className="text-[12px] font-bold text-foreground">
                {mode === "Synastry" ? "ข้อมูลดวงสมพงษ์" : "ข้อมูลดวงชะตา"}
              </span>
            </div>
            {openForm ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
          
          {openForm && (
            <div className="space-y-6 p-5 bg-background/40 backdrop-blur-md border-t border-border/50">
              
              {/* คนที่ 1 */}
              <div className="space-y-4">
                {mode === "Synastry" ? (
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="text-blue-400 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                            เจ้าชะตาคนที่ 1
                        </div>
                        {history.length > 0 && (
                            <div className="relative group">
                                <button className="flex items-center gap-1.5 text-[10px] text-blue-300 hover:text-blue-100 transition-all bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 hover:border-blue-500/50">
                                    <Clock className="h-3 w-3" />
                                    ดึงจากคลัง
                                </button>
                                <div className="absolute right-0 top-full mt-1.5 w-48 max-h-56 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="p-2 text-[9px] bg-muted/50 text-muted-foreground border-b border-border font-medium">เลือกรายชื่อจากคลัง</div>
                                    {history.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => setFormData(item.formData)}
                                            className="w-full text-left px-3 py-2 text-[11px] hover:bg-blue-500/20 hover:text-blue-200 transition-colors border-b border-white/5 last:border-0 truncate"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                        <span>ระบุข้อมูลเจ้าชะตา</span>
                        {history.length > 0 && (
                            <div className="relative group">
                                <button className="flex items-center gap-1.5 text-[10px] text-primary hover:brightness-125 transition-all bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                    <Clock className="h-3 w-3" />
                                    ดึงจากคลัง
                                </button>
                                <div className="absolute right-0 top-full mt-1.5 w-48 max-h-56 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="p-2 text-[9px] bg-muted/50 text-muted-foreground border-b border-border text-center">คลังข้อมูลดวง</div>
                                    {history.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => setFormData(item.formData)}
                                            className="w-full text-left px-3 py-2 text-[11px] hover:bg-primary/20 hover:text-primary transition-colors border-b border-white/5 last:border-0 truncate"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-primary/70 uppercase">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="ระบุชื่อผู้ต้องการผูกดวง..."
                    className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/50 transition-all font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-primary/60">วัน</label>
                    <input type="number" value={formData.day} onChange={(e) => handleInputChange("day", e.target.value)} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/40 font-medium" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-primary/60">เดือน</label>
                    <input type="number" value={formData.month} onChange={(e) => handleInputChange("month", e.target.value)} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/40 font-medium" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-primary/60">ปี (พ.ศ.)</label>
                    <input type="number" value={formData.year + 543} onChange={(e) => handleInputChange("year", (parseInt(e.target.value) - 543).toString())} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/40 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-primary/60">ชั่วโมง</label>
                    <input type="number" value={formData.hour} onChange={(e) => handleInputChange("hour", e.target.value)} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/40 font-medium" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-primary/60">นาที</label>
                    <input type="number" value={formData.minute} onChange={(e) => handleInputChange("minute", e.target.value)} className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/40 font-medium" />
                  </div>
                </div>

                <LocationSearch onSelect={(lat, lon) => setFormData(p => ({ ...p, lat, lon }))} />
              </div>

              {/* คนที่ 2 */}
              {mode === "Synastry" && (
                <div className="pt-6 border-t border-border/30 space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="text-pink-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/40" />
                        เจ้าชะตาคนที่ 2
                      </div>
                      
                      {history.length > 0 && (
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 text-[10px] text-pink-300 hover:text-pink-100 transition-all bg-pink-500/10 px-2 py-1 rounded-md border border-pink-500/20 hover:border-pink-500/50">
                                <Clock className="h-3 w-3" />
                                ดึงจากคลัง
                            </button>
                            
                            <div className="absolute right-0 top-full mt-1.5 w-48 max-h-56 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="p-2 text-[9px] bg-muted/50 text-muted-foreground border-b border-border font-medium">เลือกรายชื่อจากคลัง</div>
                                {history.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => setFormDataB(item.formData)}
                                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-pink-500/20 hover:text-pink-200 transition-colors border-b border-white/5 last:border-0 truncate"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-primary/70 uppercase">ชื่อ-นามสกุล</label>
                    <input type="text" value={formDataB.name} onChange={(e) => handleInputChange("name", e.target.value, true)} placeholder="ระบุชื่อคนที่สอง..." className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-[13px] outline-none focus:border-primary/50 transition-all font-medium" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="mb-1 block text-[10px] font-bold text-primary/60">วัน</label>
                        <input type="number" value={formDataB.day} onChange={(e) => handleInputChange("day", e.target.value, true)} className="w-full rounded-lg border border-border bg-muted/10 px-3 py-2 text-[13px] outline-none font-medium" />
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] font-bold text-primary/60">เดือน</label>
                        <input type="number" value={formDataB.month} onChange={(e) => handleInputChange("month", e.target.value, true)} className="w-full rounded-lg border border-border bg-muted/10 px-3 py-2 text-[13px] outline-none font-medium" />
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] font-bold text-primary/60">ปี (พ.ศ.)</label>
                        <input type="number" value={formDataB.year + 543} onChange={(e) => handleInputChange("year", (parseInt(e.target.value) - 543).toString(), true)} className="w-full rounded-lg border border-border bg-muted/10 px-3 py-2 text-[13px] outline-none font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-[10px] font-bold text-primary/60">ชั่วโมง</label>
                        <input type="number" value={formDataB.hour} onChange={(e) => handleInputChange("hour", e.target.value, true)} className="w-full rounded-lg border border-border bg-muted/10 px-3 py-2 text-[13px] outline-none font-medium" />
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] font-bold text-primary/60">นาที</label>
                        <input type="number" value={formDataB.minute} onChange={(e) => handleInputChange("minute", e.target.value, true)} className="w-full rounded-lg border border-border bg-muted/10 px-3 py-2 text-[13px] outline-none font-medium" />
                    </div>
                  </div>
                  <LocationSearch onSelect={(lat, lon) => setFormDataB(prev => ({ ...prev, lat, lon }))} />
                </div>
              )}

              {/* การตั้งค่าปฏิทิน */}
              <div className="pt-5 border-t border-border/40 space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-primary uppercase tracking-[0.1em]">ปฏิทินโหราศาสตร์</label>
                  <select
                    value={formData.ayanamsa_mode}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFormData(p => ({ ...p, ayanamsa_mode: val }));
                        setFormDataB(p => ({ ...p, ayanamsa_mode: val }));
                    }}
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-[13px] outline-none cursor-pointer focus:border-primary/50 transition-all font-medium"
                  >
                    {AYANAMSAS.map((a) => (
                      <option key={a.value} value={a.value} className="bg-background">{a.label}</option>
                    ))}
                  </select>
                </div>

                {formData.ayanamsa_mode === "CUSTOM" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-400 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                        <label className="mb-1.5 block text-[10px] font-bold text-orange-400 uppercase">กำหนดค่าออฟเซ็ตเอง</label>
                        <input 
                            type="number" 
                            step="0.0001"
                            value={formData.custom_ayanamsa_offset}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(p => ({ ...p, custom_ayanamsa_offset: parseFloat(val) || 0 }));
                                setFormDataB(p => ({ ...p, custom_ayanamsa_offset: parseFloat(val) || 0 }));
                            }}
                            className="w-full rounded border border-orange-500/30 bg-transparent px-3 py-2 text-[13px] outline-none text-orange-200 font-bold"
                            placeholder="0.0000"
                        />
                    </div>
                )}
              </div>

              <button
                onClick={() => mode === "Synastry" ? onCalculateCompare?.(formData, formDataB) : onCalculate(formData)}
                disabled={loading}
                className="w-full rounded-xl bg-primary py-4 text-[13px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>กำลังประมวลผล...</span>
                    </div>
                ) : (
                    mode === "Synastry" ? "คำนวณดวงสมพงษ์" : "คำนวณดวงชะตา"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* รายการประวัติ */}
      <div className="flex-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden flex flex-col shrink-0 min-h-0">
        <div className="flex items-center justify-between px-4 py-3 text-[12px] font-bold text-muted-foreground bg-muted/40 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{mode === "Transit" ? "เลือกดวงชะตาฐาน" : "คลังข้อมูลดวง"}</span>
          </div>
          <Plus className="h-4 w-4 cursor-pointer hover:text-primary transition-all hover:rotate-90 duration-300" />
        </div>
        
        <ul className="divide-y divide-border/40 overflow-y-auto flex-1 scrollbar-none">
          {history.length === 0 ? (
            <div className="p-12 text-center text-[11px] text-muted-foreground/30 italic font-medium tracking-widest">
              ไม่พบข้อมูลในคลัง
            </div>
          ) : (
            history.map((item) => (
              <li 
                key={item.id} 
                className="group relative cursor-pointer px-5 py-4 hover:bg-primary/5 transition-all border-l-4 border-transparent hover:border-primary active:bg-primary/10"
                onClick={() => {
                    setFormData(item.formData);
                    onSelectHistory(item);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[14px] text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground/70 flex items-center gap-3">
                    <span className="font-medium">{item.date}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="truncate max-w-[120px]">{item.loc}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}