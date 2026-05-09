import React from 'react';
import { Clock, Info, Star, AlertTriangle, ArrowRight, Download, Printer, X, Calendar } from 'lucide-react';

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

  const getEventTier = (planet: string) => {
    if (["Jupiter", "Saturn", "Rahu", "Ketu"].includes(planet)) return "MAJOR";
    if (["Mars", "Uranus"].includes(planet)) return "IMPORTANT";
    return "MINOR";
  };

  const getHouseKeywords = (planet: string) => {
    if (!natal_chart || !natal_chart.planets) return "";
    
    const keywords: { [key: number]: string } = {
      1: "ตนเอง/วาสนา", 2: "เงินทอง/รายได้", 3: "เพื่อน/สังคม", 4: "บ้าน/แม่/ครอบครัว", 
      5: "บุตร/การลงทุน", 6: "อุปสรรค/หนี้สิน", 7: "คู่ครอง/หุ้นส่วน", 8: "มรดก/พ้นสภาพ", 
      9: "ความสำเร็จ/โชค", 10: "การงาน/ชื่อเสียง", 11: "โชคลาภ/กำไร", 12: "รายจ่าย/เบื้องหลัง"
    };

    // Calculate which houses this planet rules in the natal chart
    // Sign Lords mapping (Thai Standard)
    const signLords = [0, 2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]; // Index 1-12
    const planetToId: { [key: string]: number } = {
      "Sun": 0, "Moon": 1, "Mars": 2, "Mercury": 3, "Jupiter": 4, "Venus": 5, "Saturn": 6, "Rahu": 7
    };

    const targetPlanetId = planetToId[planet];
    if (targetPlanetId === undefined) return "";

    const ruledHouses = [];
    const lagnaSign = natal_chart.lagna.sign; // 1-12

    for (let sign = 1; sign <= 12; sign++) {
        if (signLords[sign] === targetPlanetId) {
            // Find house number: (Sign - LagnaSign + 12) % 12 + 1
            const houseNum = (sign - lagnaSign + 12) % 12 + 1;
            ruledHouses.push(keywords[houseNum]);
        }
    }

    return ruledHouses.length > 0 ? `(${ruledHouses.join("/")})` : "";
  };

  const getEventColorClass = (event: any) => {
    const tier = getEventTier(event.planet);
    const dignity = event.dignity || "";
    const isGood = ["อุจจ์", "เกษตร", "ราชาโชค", "มหาจักร", "เทวีโชค", "มูลตรีโกณ"].some(d => dignity.includes(d));
    const isBad = ["นิจ", "ประ"].some(d => dignity.includes(d));
    const isRetro = event.status === "RETROGRADE";
    
    if (tier === "MAJOR") return isBad || isRetro ? "major-bad" : "major-good";
    if (isGood && !isRetro) return "good";
    if (isBad || isRetro) return "warn";
    return "neutral";
  };

  const getEventDotColor = (colorClass: string) => {
    switch (colorClass) {
      case "major-good": return "#8B5CF6"; // Purple for Major Good
      case "major-bad": return "#EF4444"; // Strong Red for Major Bad
      case "good": return "#10B981"; // Emerald
      case "warn": return "#F59E0B"; // Amber
      case "info": return "#3B82F6"; // Blue
      default: return "#94A3B8"; // Slate
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
    const tier = getEventTier(event.planet);
    const dignity = event.dignity || "";
    const isRetro = event.status === "RETROGRADE";
    
    // Tiered Label
    let prefix = "";
    if (tier === "MAJOR") prefix = "🔥 จุดเปลี่ยนชีวิต: ";
    else if (tier === "IMPORTANT") prefix = "📌 สำคัญ: ";

    if (isRetro) return prefix + "พักร (ถอยหลัง)";
    if (["นิจ", "ประ"].some(d => dignity.includes(d))) return prefix + "ระวัง";
    if (["อุจจ์", "เกษตร", "มูลตรีโกณ"].some(d => dignity.includes(d))) return prefix + "ดีมาก";
    if (["ราชาโชค", "มหาจักร", "เทวีโชค"].some(d => dignity.includes(d))) return prefix + "ดี";
    if (event.type === "INGRESS") return prefix + "ย้ายราศี";
    return prefix || null;
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

  const handleExportICS = () => {
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aetox Astro//Timeline//TH",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:ดวงชะตา - " + (data.natal_chart.name || "Aetox"),
      "X-WR-TIMEZONE:Asia/Bangkok"
    ];

    events.forEach((event: any, idx: number) => {
      const tier = getEventTier(event.planet);
      const date = new Date(event.timestamp);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      
      const dateStr = `${year}${month}${day}`;
      
      // Emoji based on Tier and Status
      let emoji = "✨";
      if (tier === "MAJOR") emoji = event.status === "RETROGRADE" ? "⚠️🔥" : "🔥";
      else if (tier === "IMPORTANT") emoji = "📌";
      else if (event.status === "RETROGRADE") emoji = "🔄";

      const summary = `${emoji} ${event.description}`;
      
      let description = `🔭 วิเคราะห์โหราศาสตร์โดย Aetox\\n\\n`;
      description += `เหตุการณ์: ${event.description}\\n`;
      if (event.dignity) description += `ตำแหน่งดาว: ${event.dignity}\\n`;
      description += `ความสำคัญ: ${tier}\\n\\n`;
      
      if (event.natal_aspects && event.natal_aspects.length > 0) {
        description += `💥 มุมสัมพันธ์ดวงเดิม:\\n`;
        event.natal_aspects.forEach((a: any) => {
          const keywords = getHouseKeywords(a.p2);
          description += `- ${a.aspect}กับ ${a.p2}เดิม ${keywords}\\n`;
        });
      }

      icsContent.push("BEGIN:VEVENT");
      icsContent.push(`UID:${Date.now()}-${idx}@aetox.astro`);
      icsContent.push(`DTSTAMP:${dateStr}T000000Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
      icsContent.push(`DTEND;VALUE=DATE:${dateStr}`);
      icsContent.push(`SUMMARY:${summary}`);
      icsContent.push(`DESCRIPTION:${description}`);
      icsContent.push("BEGIN:VALARM");
      icsContent.push("ACTION:DISPLAY");
      icsContent.push(`DESCRIPTION:แจ้งเตือนเหตุการณ์ดวงชะตา: ${event.description}`);
      icsContent.push("TRIGGER:-PT9H"); // Alert at 9 AM
      icsContent.push("END:VALARM");
      icsContent.push("END:VEVENT");
    });

    icsContent.push("END:VCALENDAR");

    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Astro_Timeline_${data.natal_chart.name || 'User'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-50 overflow-y-auto print:static print:bg-white text-slate-900">
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
          <button onClick={handleExportICS} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
            <Calendar className="h-4 w-4" /> บันทึกปฏิทิน (.ics)
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
                        const tier = getEventTier(event.planet);
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
                          <div key={idx} className={`group ${tier === 'MAJOR' ? 'bg-slate-50/50 p-4 rounded-2xl border border-slate-100 -mx-4' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div 
                                className={`mt-2 rounded-full shrink-0 shadow-sm ${tier === 'MAJOR' ? 'w-3 h-3' : 'w-2 h-2'}`} 
                                style={{ background: getEventDotColor(colorClass) }}
                              ></div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-slate-400 text-sm">{dayTh} {monthsTh[month]}</span>
                                  <span className={`text-slate-800 ${tier === 'MAJOR' ? 'text-lg font-black' : 'text-[14px] font-medium'}`}>
                                    {description}
                                  </span>
                                  {pillLabel && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getPillClass(colorClass)}`}>
                                      {pillLabel}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Secondary Info: Aspects to Natal */}
                                {event.natal_aspects && event.natal_aspects.length > 0 && (
                                  <div className="mt-2 pl-4 border-l-2 border-slate-50 space-y-1.5">
                                    {event.natal_aspects.slice(0, 5).map((aspect: any, aIdx: number) => (
                                      <p key={aIdx} className="text-[11px] text-slate-500 font-medium">
                                        • {aspectNameTh[aspect.aspect] || aspect.aspect}กับ {planetNameTh[aspect.p2] || aspect.p2} เดิม 
                                        <span className="text-indigo-400 ml-1">{getHouseKeywords(aspect.p2)}</span>
                                        <span className="opacity-50 ml-1">(orb {aspect.orb_diff?.toFixed(2) || '0.00'}°)</span>
                                      </p>
                                    ))}
                                  </div>
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
