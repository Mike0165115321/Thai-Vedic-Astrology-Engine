import React from 'react';
import { Calendar, User, Star, MapPin, Clock, ArrowRight } from 'lucide-react';

interface TransitReportProps {
  data: any;
  onClose: () => void;
}

const TransitReport: React.FC<TransitReportProps> = ({ data, onClose }) => {
  if (!data) return null;

  const { natal_chart, initial_transits, events, total_events } = data;

  const printReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto print:static print:bg-white">
      {/* Action Bar (Hidden when printing) */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-muted/80 backdrop-blur-md border-b border-border print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-bold text-foreground">AETOX ASTRO - รายงานการวิเคราะห์ดวงจร</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ย้อนกลับ
          </button>
          <button 
            onClick={printReport}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            พิมพ์รายงาน (PDF)
          </button>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="max-w-[210mm] mx-auto my-8 p-[15mm] bg-white text-slate-900 shadow-2xl print:shadow-none print:my-0 print:p-0">
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-primary">AETOX ASTRO</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800">รายงานการวิเคราะห์ดวงจร 120 ปี</h2>
            <p className="text-slate-500 mt-1">สรุปเหตุการณ์ดาวจรเชิงลึกตลอดอายุขัย</p>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <p className="flex items-center justify-end gap-2"><User className="h-4 w-4" /> {natal_chart?.name || 'ไม่ระบุชื่อ'}</p>
            <p className="flex items-center justify-end gap-2"><Calendar className="h-4 w-4" /> เกิด: {natal_chart?.birth_date || '-'}</p>
            <p className="flex items-center justify-end gap-2"><MapPin className="h-4 w-4" /> {natal_chart?.location || '-'}</p>
          </div>
        </div>

        {/* AXIS 1: Natal Chart Summary */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Axis 1: พื้นดวงชะตากำเนิด (Natal Chart)</h3>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(natal_chart?.planets || {}).map(([name, p]: [string, any]) => (
              <div key={name} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{name}</p>
                <p className="text-lg font-bold text-primary">{p.degree_text}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.dignity_list?.map((d: string) => (
                    <span key={d} className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold">{d}</span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">เรือน: {p.house}</p>
              </div>
            ))}
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-[10px] uppercase font-bold text-primary mb-1">ลัคนา (Lagna)</p>
              <p className="text-lg font-bold text-primary">{natal_chart?.lagna?.degree_text}</p>
              <p className="text-[10px] text-slate-500 mt-1">ราศี: {natal_chart?.lagna?.sign}</p>
            </div>
          </div>
        </section>

        {/* AXIS 2: Initial Transit Snapshot */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Axis 2: ดาวจร ณ จุดเริ่มต้น (Start Transits)</h3>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-amber-900 border-b border-amber-200 pb-2">มุมสัมพันธ์ดาวจรส่งผลถึงดวงเดิม</h4>
              <div className="space-y-2">
                {initial_transits?.natal_aspects?.slice(0, 6).map((asp: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white/60 p-2 rounded-lg">
                    <span className="font-bold">{asp.p1} (จร)</span>
                    <span className="text-amber-600 font-black">{asp.aspect}</span>
                    <span className="font-bold">{asp.p2} (เดิม)</span>
                  </div>
                ))}
                {(!initial_transits?.natal_aspects || initial_transits.natal_aspects.length === 0) && (
                  <p className="text-xs text-amber-700 italic">ไม่พบมุมสัมพันธ์ที่สำคัญ</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900 border-b border-amber-200 pb-2">ดาวจรที่โดดเด่นในวันแรก</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(initial_transits?.planets || {}).filter(([_, p]: [string, any]) => p.dignity_list?.length > 1).map(([name, p]: [string, any]) => (
                  <div key={name} className="text-[10px] p-1.5 bg-white rounded border border-amber-100">
                    <span className="font-bold">{name}:</span> {p.dignity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AXIS 3: The Timeline */}
        <section className="page-break-before">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Axis 3: ไทม์ไลน์เหตุการณ์สำคัญ (Timeline)</h3>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">พบทั้งหมด {total_events} เหตุการณ์</span>
          </div>

          <div className="space-y-4 relative">
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-slate-100"></div>
            {events.map((event: any, idx: number) => (
              <div key={idx} className="relative pl-14 pb-6 group break-inside-avoid">
                {/* Date Bubble */}
                <div className="absolute left-0 top-0 w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex flex-col items-center justify-center z-10 group-hover:border-primary transition-colors">
                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none">
                    {new Date(event.timestamp).toLocaleDateString('th-TH', { month: 'short' })}
                  </span>
                  <span className="text-lg font-black text-slate-800 leading-none mt-0.5">
                    {new Date(event.timestamp).getDate()}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${event.type === 'INGRESS' ? 'bg-primary' : 'bg-amber-500'}`}>
                        {event.type}
                      </span>
                      <h4 className="font-bold text-slate-800">{event.planet}</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      พ.ศ. {new Date(event.timestamp).getFullYear() + 543}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400">องศา:</span>
                      <span className="text-[11px] font-bold text-primary">{event.degree_text}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400">เรือนชะตา:</span>
                      <span className="text-[11px] font-bold text-primary">{event.house || '-'}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400">มาตรฐาน:</span>
                      <span className="text-[11px] font-bold text-primary truncate ml-1">{event.dignity || 'ปกติ'}</span>
                    </div>
                  </div>

                  {event.natal_aspects?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">ทำมุมสัมพันธ์กับดวงเดิม:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.natal_aspects.map((asp: any, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-md text-[10px]">
                            <span className="font-bold text-slate-700">{asp.p2}</span>
                            <span className="text-primary font-black uppercase text-[8px]">{asp.aspect}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-[10px]">
          <p>© 2026 AETOX ASTRO ENGINE - ระบบวิเคราะห์ดวงชะตาอัจฉริยะ</p>
          <p>ข้อมูลในรายงานนี้เป็นไปเพื่อการวิเคราะห์ทางสถิติและโหราศาสตร์เท่านั้น</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          .page-break-before {
            page-break-before: always;
          }
          .break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default TransitReport;
