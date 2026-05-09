import React from 'react';
import { Clock, Info, Star, AlertTriangle, ArrowRight, Download, Printer, X } from 'lucide-react';

interface TransitTimelineReportProps {
  data: any;
  onClose: () => void;
}

export function TransitTimelineReport({ data, onClose }: TransitTimelineReportProps) {
  if (!data) return null;

  const { natal_chart, events, total_events, scan_period_days } = data;

  // Group events by Year and then by Month
  const groupedEvents: { [year: number]: { [month: number]: any[] } } = {};

  events.forEach((event: any) => {
    const date = new Date(event.timestamp);
    const year = date.getFullYear() + 543; // Buddhist Era
    const month = date.getMonth() + 1;

    if (!groupedEvents[year]) groupedEvents[year] = {};
    if (!groupedEvents[year][month]) groupedEvents[year][month] = [];
    groupedEvents[year][month].push(event);
  });

  const years = Object.keys(groupedEvents).map(Number).sort((a, b) => a - b);

  const monthsTh = [
    "", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const getEventColorClass = (event: any) => {
    const dignity = event.dignity || "";
    const isGood = ["อุจจ์", "เกษตร", "ราชาโชค", "มหาจักร", "เทวีโชค", "มูลตรีโกณ"].some(d => dignity.includes(d));
    const isBad = ["นิจ", "ประ"].some(d => dignity.includes(d));
    const isRetro = event.status === "Retrograde";
    
    if (isGood && !isRetro) return "good";
    if (isBad || isRetro) return "warn";
    if (event.type === "Zodiac Entry") return "info";
    return "neutral";
  };

  const getEventDotColor = (colorClass: string) => {
    switch (colorClass) {
      case "good": return "#1D9E75";
      case "warn": return "#BA7517";
      case "bad": return "#E24B4A";
      case "info": return "#378ADD";
      default: return "#888780";
    }
  };

  const getPillClass = (colorClass: string) => {
    switch (colorClass) {
      case "good": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "warn": return "bg-amber-50 text-amber-700 border-amber-200";
      case "bad": return "bg-rose-50 text-rose-700 border-rose-200";
      case "info": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPillLabel = (event: any) => {
    const dignity = event.dignity || "";
    const isRetro = event.status === "RETROGRADE";
    
    // Priority 1: Retrograde / Bad Dignity (Warnings)
    if (isRetro) return "พักร (ถอยหลัง)";
    if (["นิจ", "ประ"].some(d => dignity.includes(d))) return "ระวัง";
    
    // Priority 2: High Dignity (Good)
    if (["อุจจ์", "เกษตร", "มูลตรีโกณ"].some(d => dignity.includes(d))) return "ดีมาก";
    if (["ราชาโชค", "มหาจักร", "เทวีโชค"].some(d => dignity.includes(d))) return "ดี";
    
    // Priority 3: Special Events
    if (event.type === "INGRESS") return "ย้ายราศี";
    return null;
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const firstName = data.natal_chart.name.split(" ")[0];
    const fileName = `Scan_${firstName}_${new Date().getTime()}.json`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-50 overflow-y-auto print:static print:bg-white text-slate-900" style={{ fontFamily: 'var(--font-sarabun), sans-serif' }}>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            visibility: hidden;
          }
          #timeline-report-container {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .month-group {
            break-inside: avoid;
            margin-bottom: 2rem;
          }
        }
      `}</style>

      {/* Navbar Controls */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 rounded-lg">
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none">Timeline วิเคราะห์ดาวจรเชิงลึก</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Aetox Astro Timeline Report</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
            <X className="h-4 w-4" /> ปิดหน้าต่าง
          </button>
          <button onClick={handleDownloadJSON} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
            <Download className="h-4 w-4" /> บันทึก JSON
          </button>
          <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black active:scale-95 transition-all flex items-center gap-2">
            <Printer className="h-4 w-4" /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      <div id="timeline-report-container" className="max-w-3xl mx-auto my-8 p-10 bg-white shadow-2xl rounded-3xl print:shadow-none print:my-0 print:p-0 print:w-full min-h-[297mm]">
        
        {/* Header Section */}
        <div className="mb-8 border-b-2 border-slate-100 pb-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Transit Timeline</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
            <p className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> เจ้าชะตา: <span className="text-slate-900 font-bold">{natal_chart?.name || 'ไม่ระบุชื่อ'}</span></p>
            <p>ช่วงเวลา: <span className="text-slate-900 font-bold">{scan_period_days} วัน</span></p>
            <p>จำนวนเหตุการณ์: <span className="text-slate-900 font-bold">{total_events} รายการ</span></p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ background: getEventDotColor("good") }}></div> เหตุการณ์ดี / ดาวเสริม
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ background: getEventDotColor("warn") }}></div> ต้องระวัง / ดาวกดดัน
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ background: getEventDotColor("info") }}></div> การเปลี่ยนแปลงสำคัญ
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ background: getEventDotColor("neutral") }}></div> ทั่วไป / เปลี่ยนราศี
          </div>
        </div>

        {/* Timeline Content */}
        <div className="space-y-12">
          {years.map(year => (
            <div key={year} className="relative">
              <div className="sticky top-16 z-1 print:static py-2 bg-white mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-3">
                  <span className="text-slate-900 text-lg tracking-normal">{year}</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </h3>
              </div>

              <div className="space-y-6">
                {Object.keys(groupedEvents[year]).map(Number).sort((a, b) => a - b).map(month => (
                  <div key={`${year}-${month}`} className="grid grid-cols-[80px_1fr] gap-0 month-group">
                    <div className="text-right pr-6 py-2 border-r-2 border-slate-100 font-bold text-slate-400 text-sm">
                      {monthsTh[month]}
                    </div>
                    <div className="pl-6 py-1 space-y-4">
                      {groupedEvents[year][month].map((event, idx) => {
                        const colorClass = getEventColorClass(event);
                        const pillLabel = getPillLabel(event);
                        const eventDate = new Date(event.timestamp);
                        const dayTh = eventDate.getDate();

                        const planetNameTh: { [key: string]: string } = {
                          "Sun": "อาทิตย์ (๑)", "Moon": "จันทร์ (๒)", "Mars": "อังคาร (๓)", 
                          "Mercury": "พุธ (๔)", "Jupiter": "พฤหัสบดี (๕)", "Venus": "ศุกร์ (๖)", 
                          "Saturn": "เสาร์ (๗)", "Rahu": "ราหู (๘)", "Ketu": "เกตุ (๙)", "Uranus": "มฤตยู (๐)"
                        };

                        const aspectNameTh: { [key: string]: string } = {
                          "Conjunction": "กุม", "Opposition": "เล็ง", "Square": "ฉาก", 
                          "Trine": "ตรีโกณ", "Sextile": "โยค"
                        };

                        const description = event.description;

                        return (
                          <div key={idx} className="group">
                            <div className="flex items-start gap-3">
                              <div 
                                className="mt-2 w-2 h-2 rounded-full shrink-0 shadow-sm" 
                                style={{ background: getEventDotColor(colorClass) }}
                              ></div>
                              <div className="space-y-1">
                                <p className="text-[14px] font-medium leading-relaxed">
                                  <span className="font-bold text-slate-400 mr-2">{dayTh} {monthsTh[month]}</span>
                                  <span className="text-slate-800">{description}</span>
                                  {pillLabel && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getPillClass(colorClass)}`}>
                                      {pillLabel}
                                    </span>
                                  )}
                                </p>
                                
                                {/* Secondary Info: Aspects to Natal */}
                                {event.natal_aspects && event.natal_aspects.length > 0 && (
                                  <div className="mt-2 pl-4 border-l-2 border-slate-50 space-y-1">
                                    {event.natal_aspects.slice(0, 3).map((aspect: any, aIdx: number) => (
                                      <p key={aIdx} className="text-[11px] text-slate-500 font-medium">
                                        • {aspectNameTh[aspect.aspect] || aspect.aspect}กับ {planetNameTh[aspect.p2] || aspect.p2} เดิม (orb {aspect.orb_diff?.toFixed(2) || '0.00'}°)
                                      </p>
                                    ))}
                                  </div>
                                ) || (
                                  event.type === "Zodiac Entry" && event.dignity_list && event.dignity_list.length > 0 && (
                                    <p className="text-[11px] text-indigo-500/70 font-bold ml-1">
                                      ✨ ได้ตำแหน่ง: {event.dignity_list.join(", ")}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
          <div>Aetox Astro Engine v1.0 — Technical Report</div>
          <div>Printed at {new Date().toLocaleString('th-TH')}</div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .fixed { position: static !important; }
          .overflow-y-auto { overflow: visible !important; }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          .rounded-3xl { border-radius: 0 !important; }
          .shadow-2xl { shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
