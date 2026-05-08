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
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">พื้นดวงชะตากำเนิด (Natal Chart)</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(natal_chart?.planets || {}).map(([name, p]: [string, any]) => (
              <div key={name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <p className="text-[10px] uppercase font-black text-slate-400 mb-2">{name}</p>
                <div className="text-2xl font-black text-primary mb-1">{p.degree_text}</div>
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {p.dignity_list?.map((d: string) => (
                    <span key={d} className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">{d}</span>
                  ))}
                </div>
                <div className="mt-auto pt-2 border-t border-slate-200 w-full">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">เรือน {p.house}</p>
                  <p className="text-[9px] text-slate-400">{p.nakshatra}</p>
                </div>
              </div>
            ))}
            
            {/* Lagna Card */}
            <div className="p-4 bg-primary rounded-2xl text-white flex flex-col items-center text-center shadow-lg shadow-primary/20">
              <p className="text-[10px] uppercase font-black text-white/60 mb-2">ลัคนา (Lagna)</p>
              <div className="text-2xl font-black mb-1">{natal_chart?.lagna?.degree_text}</div>
              <div className="mt-auto pt-2 border-t border-white/20 w-full">
                <p className="text-[10px] font-bold uppercase">ราศี {natal_chart?.lagna?.sign}</p>
              </div>
            </div>
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
