"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Loader2, ChevronDown, X } from "lucide-react";
import { THAI_PROVINCES } from "./thai_provinces";

type LocationResult = {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string;
    province?: string;
  };
};

type Props = {
  onSelect: (lat: number, lon: number, name: string) => void;
};

export function LocationSearch({ onSelect }: Props) {
  const [province, setProvince] = useState("");
  const [provinceEn, setProvinceEn] = useState("");
  const [amphoe, setAmphoe] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"province" | "results" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProvinces = useMemo(() => {
    if (!province) return THAI_PROVINCES.slice(0, 5);
    return THAI_PROVINCES.filter(p => 
        p.name_th.includes(province) || 
        p.name_en.toLowerCase().includes(province.toLowerCase())
    ).slice(0, 8);
  }, [province]);

  const searchLocations = async (query: string) => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      // Strategy: Search for District, Province, Thailand
      const fullQuery = province ? `${query}, ${provinceEn || province}, Thailand` : `${query}, Thailand`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(fullQuery)}&accept-language=th,en&limit=5`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Filter results to ensure they are in Thailand and ideally in the selected province
      let filtered = data;
      if (province) {
          const pSearch = (provinceEn || province).toLowerCase();
          filtered = data.filter((res: any) => {
              const dn = res.display_name.toLowerCase();
              return dn.includes("thailand") && (dn.includes(pSearch) || dn.includes(province.toLowerCase()));
          });
      }
      
      setResults(filtered);
      setOpenDropdown("results");
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (amphoe.length < 2) {
        setResults([]);
        return;
    }
    const timer = setTimeout(() => searchLocations(amphoe), 800);
    return () => clearTimeout(timer);
  }, [amphoe, provinceEn]);

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <label className="text-[9px] uppercase text-muted-foreground mb-1 block font-bold">จังหวัด (Province)</label>
          <div className="relative">
            <input
              type="text"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setOpenDropdown("province");
              }}
              onFocus={() => setOpenDropdown("province")}
              placeholder="เลือกจังหวัด..."
              className="w-full bg-input/50 border border-border rounded px-2 py-1.5 font-sans text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            {province ? (
                <button 
                    onClick={() => { setProvince(""); setProvinceEn(""); setAmphoe(""); setResults([]); }}
                    className="absolute right-7 top-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-3 w-3" />
                </button>
            ) : null}
            <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-muted-foreground" />
          </div>
          {openDropdown === "province" && filteredProvinces.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-2xl divide-y divide-border animate-in fade-in zoom-in-95 duration-200">
                {filteredProvinces.map(p => (
                    <li key={p.id} 
                        onClick={() => {
                            setProvince(p.name_th);
                            setProvinceEn(p.name_en);
                            setOpenDropdown(null);
                        }}
                        className="px-3 py-2 text-[10px] hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex justify-between items-center"
                    >
                        <span>{p.name_th}</span>
                        <span className="text-[8px] opacity-60 uppercase">{p.name_en}</span>
                    </li>
                ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="text-[9px] uppercase text-muted-foreground mb-1 block font-bold">อำเภอ / เขต (District)</label>
          <div className="relative">
            <input
              type="text"
              value={amphoe}
              onChange={(e) => setAmphoe(e.target.value)}
              onFocus={() => { if (results.length > 0) setOpenDropdown("results"); }}
              placeholder={province ? `ค้นหาใน${province}...` : "ระบุอำเภอ..."}
              className="w-full bg-input/50 border border-border rounded px-2 py-1.5 font-sans text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            {loading && <Loader2 className="absolute right-2 top-2.5 h-3 w-3 animate-spin text-primary" />}
          </div>
        </div>
      </div>

      {openDropdown === "results" && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-[calc(100%-24px)] max-h-60 overflow-y-auto rounded-md border border-primary/30 bg-card shadow-2xl divide-y divide-border animate-in slide-in-from-top-2 duration-200">
          <li className="px-3 py-1 bg-primary/10 text-[8px] text-primary font-bold uppercase tracking-widest">
            {province ? `ผลลัพธ์ในจังหวัด${province}` : "ผลการค้นหา"}
          </li>
          {results.map((res, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(parseFloat(res.lat), parseFloat(res.lon), res.display_name);
                setAmphoe(res.display_name.split(",")[0]);
                setOpenDropdown(null);
              }}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted cursor-pointer transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-foreground">{res.display_name.split(",")[0]}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">{res.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
