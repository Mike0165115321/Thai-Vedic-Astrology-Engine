"use client";

import React, { useState } from 'react';
import { X, FileJson, FileText, FileCode2, Check, Download, Star, Orbit } from 'lucide-react';

interface ExportNatalModalProps {
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  chartName: string;
}

export interface ExportConfig {
  source: 'natal' | 'transit';
  format: 'JSON' | 'PDF' | 'MD';
  sections: {
    basicInfo: boolean;
    planetTable: boolean;
    yogas: boolean;
    dasha: boolean;
  };
  tableColumns: {
    degrees: boolean;
    house: boolean;
    lordship: boolean;
    d1: boolean;
    d3: boolean;
    d9: boolean;
    nakshatra: boolean;
  };
}

export function ExportNatalModal({ onClose, onExport, chartName }: ExportNatalModalProps) {
  const [source, setSource] = useState<'natal' | 'transit'>('natal');
  const [format, setFormat] = useState<'JSON' | 'PDF' | 'MD'>('PDF');
  const [sections, setSections] = useState({
    basicInfo: true,
    planetTable: true,
    yogas: true,
    dasha: true
  });
  const [columns, setColumns] = useState({
    degrees: true,
    house: true,
    lordship: true,
    d1: true,
    d3: true,
    d9: true,
    nakshatra: true
  });

  const isTransit = source === 'transit';
  // Transit only supports MD/JSON (not PDF — no full report renderer for transit)
  const availableFormats = isTransit
    ? (['MD', 'JSON'] as const)
    : (['PDF', 'MD', 'JSON'] as const);

  // Auto-correct format when switching sources
  const handleSourceChange = (s: 'natal' | 'transit') => {
    setSource(s);
    if (s === 'transit' && format === 'PDF') setFormat('MD');
  };

  const handleExport = () => {
    onExport({ source, format, sections, tableColumns: columns });
  };

  const formatMeta: Record<string, { icon: React.ReactNode; label: string; sub: string }> = {
    PDF:  { icon: <FileText className="h-7 w-7" />,  label: 'PDF Report',  sub: 'สำหรับพิมพ์' },
    MD:   { icon: <FileCode2 className="h-7 w-7" />, label: 'Markdown',    sub: 'Obsidian / Notion' },
    JSON: { icon: <FileJson className="h-7 w-7" />,  label: 'JSON Data',   sub: 'สำหรับนักพัฒนา' },
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            ส่งออกข้อมูล: {chartName}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">

          {/* Source Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">แหล่งข้อมูล (Source)</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-xl border border-white/5">
              {([
                { id: 'natal',   icon: <Star className="h-4 w-4" />,  label: 'ดวงกำเนิด' },
                { id: 'transit', icon: <Orbit className="h-4 w-4" />, label: 'ดาวจร' },
              ] as const).map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleSourceChange(id)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                    source === id
                      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            {isTransit && (
              <p className="text-[10px] text-amber-400/70 font-medium px-1">
                * ดาวจร: ส่งออกได้ Markdown และ JSON เท่านั้น
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">รูปแบบไฟล์ (Format)</label>
            <div className={`grid gap-3 ${availableFormats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {availableFormats.map((fmt) => {
                const m = formatMeta[fmt];
                return (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      format === fmt
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border bg-muted/20 hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className={format === fmt ? 'text-primary' : 'text-muted-foreground'}>
                      {m.icon}
                    </span>
                    <div className="text-center">
                      <div className="text-sm font-bold">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">{m.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Natal-only options */}
          {!isTransit && (
            <>
              {/* Content Sections */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ส่วนที่ต้องการรวม (Sections)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries({
                    basicInfo: "ข้อมูลพื้นฐาน",
                    planetTable: "ตารางดาวสถิต",
                    yogas: "โยค / เกณฑ์ชะตาพิเศษ",
                    dasha: "ทักษา/วิมโชตตรี"
                  }) as [keyof typeof sections, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSections(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                        sections[key]
                          ? 'border-primary/50 bg-primary/5 text-foreground'
                          : 'border-border bg-transparent text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                        sections[key] ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      }`}>
                        {sections[key] && <Check className="h-3 w-3" />}
                      </div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Columns */}
              {sections.planetTable && (
                <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">คอลัมน์ในตารางดาว (Table Columns)</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { k: 'degrees',   l: 'องศาดาว' },
                      { k: 'house',     l: 'ภพสถิต' },
                      { k: 'lordship',  l: 'เจ้าเรือน' },
                      { k: 'd1',        l: 'ราศีจักร (D1)' },
                      { k: 'd3',        l: 'ตรียางศ์ (D3)' },
                      { k: 'd9',        l: 'นวางศ์ (D9)' },
                      { k: 'nakshatra', l: 'นักษัตร' },
                    ].map((col) => (
                      <label key={col.k} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={columns[col.k as keyof typeof columns]}
                          onChange={() => setColumns(prev => ({ ...prev, [col.k]: !prev[col.k as keyof typeof columns] }))}
                          className="h-3.5 w-3.5 rounded border-border bg-card accent-primary"
                        />
                        <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{col.l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted/10">
          <button
            onClick={handleExport}
            className="w-full rounded-xl bg-(image:--gradient-gold) py-3 text-sm font-black text-primary-foreground shadow-(--shadow-glow) hover:opacity-90 active:scale-[0.98] transition-all"
          >
            ส่งออก {source === 'transit' ? 'ดาวจร' : 'ดวงกำเนิด'} ({format === 'MD' ? 'Markdown .md' : format})
          </button>
        </div>
      </div>
    </div>
  );
}
