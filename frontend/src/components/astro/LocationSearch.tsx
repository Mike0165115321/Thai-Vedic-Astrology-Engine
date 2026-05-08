"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, MapPin, Loader2, ChevronDown, X, Crosshair } from "lucide-react";
import { THAI_PROVINCES } from "./thai_provinces";
import { THAI_DISTRICTS } from "./thai_data";

type LocationResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
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
  labelColor?: string;
  accentColor?: string;
};

export function LocationSearch({ onSelect, labelColor = "text-primary", accentColor = "primary" }: Props) {
  const [province, setProvince] = useState("");
  const [provinceEn, setProvinceEn] = useState("");
  const [amphoe, setAmphoe] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"province" | "results" | "suggestions" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const localSuggestions = useMemo(() => {
    if (!province || !THAI_DISTRICTS[province]) return [];
    const list = THAI_DISTRICTS[province];
    if (!amphoe) return list;
    return list.filter(d => 
        d.name_th.includes(amphoe) || 
        d.name_en.toLowerCase().includes(amphoe.toLowerCase())
    );
  }, [province, amphoe]);

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

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) return;
    setLoading(true);
    
    try {
      // Improve query: if searching for common district terms, make it more specific
      let refinedQuery = query;
      if (query === "เมือง" || query === "เมืองน่าน" || query.length < 5) {
          refinedQuery = `อำเภอ${query}`;
      }

      const fullQuery = province ? `${refinedQuery}, ${provinceEn || province}, Thailand` : `${refinedQuery}, Thailand`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(fullQuery)}&accept-language=th,en&limit=5`;
      
      const response = await fetch(url, {
          headers: { 'Accept-Language': 'th,en' }
      });
      const data = await response.json();
      
      let filtered = data.filter((res: any) => {
          const dn = res.display_name.toLowerCase();
          return dn.includes("thailand") || dn.includes("ประเทศไทย");
      });

      if (province) {
          const pSearch = (provinceEn || province).toLowerCase();
          const pThai = province.toLowerCase();
          filtered = filtered.filter((res: any) => {
              const dn = res.display_name.toLowerCase();
              const addr = res.address || {};
              const provinceInAddr = (addr.province || addr.state || addr.city || "").toLowerCase();
              return dn.includes(pSearch) || dn.includes(pThai) || provinceInAddr.includes(pSearch) || provinceInAddr.includes(pThai);
          });
      }
      
      setResults(filtered);
      
      // Auto-select first result ONLY if we don't have local suggestions or they are weak
      if (filtered.length > 0 && query.length >= 4 && localSuggestions.length === 0) {
          const first = filtered[0];
          onSelect(parseFloat(first.lat), parseFloat(first.lon), first.display_name);
      }
      
      if (filtered.length > 0) setOpenDropdown("results");
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  }, [province, provinceEn, onSelect, localSuggestions.length]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onSelect(latitude, longitude, "ตำแหน่งปัจจุบัน (Current Location)");
        setLoading(false);
        setProvince("ตำแหน่งปัจจุบัน");
        setAmphoe("");
      },
      (err) => {
        console.error(err);
        alert("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาตรวจสอบการอนุญาต");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (amphoe.length < 2) {
        setResults([]);
        return;
    }
    // Don't trigger search if dropdown is null (means we just selected something or closed it)
    if (openDropdown === null) return;

    const timer = setTimeout(() => searchLocations(amphoe), 800);
    return () => clearTimeout(timer);
  }, [amphoe, searchLocations, openDropdown]);

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
            <label className={`text-[9px] uppercase ${labelColor} font-bold`}>สถานที่เกิด / จังหวัด</label>
        </div>
        <button 
            onClick={getCurrentLocation}
            className="flex items-center gap-1 text-[9px] font-black uppercase text-primary/80 hover:text-primary transition-all px-1.5 py-0.5 rounded border border-primary/20 hover:border-primary/40 bg-primary/5"
        >
            <Crosshair className="h-2.5 w-2.5" />
            ใช้ตำแหน่งปัจจุบัน
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setOpenDropdown("province");
              }}
              onFocus={() => setOpenDropdown("province")}
              placeholder="จังหวัด..."
              className={`w-full bg-input/50 border border-border rounded px-2 py-1.5 font-sans text-xs focus:ring-1 focus:ring-${accentColor} outline-none transition-all`}
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
                            setOpenDropdown("suggestions"); // Open suggestions after choosing province
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
          <div className="relative">
            <input
              type="text"
              value={amphoe}
              onChange={(e) => {
                  setAmphoe(e.target.value);
                  if (openDropdown !== "suggestions") setOpenDropdown("suggestions");
              }}
              onFocus={() => { 
                  if (localSuggestions.length > 0) setOpenDropdown("suggestions");
                  else if (results.length > 0) setOpenDropdown("results"); 
              }}
              placeholder={province ? `ค้นหาใน${province}...` : "อำเภอ / เขต..."}
              className={`w-full bg-input/50 border border-border rounded px-2 py-1.5 font-sans text-xs focus:ring-1 focus:ring-${accentColor} outline-none transition-all`}
            />
            {loading && <Loader2 className={`absolute right-2 top-2.5 h-3 w-3 animate-spin text-${accentColor}`} />}
          </div>
        </div>
      </div>

      {/* Local Suggestions (Instant) */}
      {openDropdown === "suggestions" && localSuggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-[calc(100%-12px)] max-h-60 overflow-y-auto rounded-md border border-primary/30 bg-card shadow-2xl divide-y divide-border animate-in slide-in-from-top-2 duration-200 left-1.5">
          <li className="px-3 py-1 bg-primary/10 text-[8px] text-primary font-bold uppercase tracking-widest flex justify-between">
            <span>รายชื่ออำเภอในจังหวัด{province}</span>
            <span className="opacity-60 italic font-medium">ฐานข้อมูลระบบ</span>
          </li>
          {localSuggestions.map((d, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(d.lat, d.lon, `อ.${d.name_th}, จ.${province}`);
                setAmphoe(`อ.${d.name_th}`);
                setResults([]);
                setOpenDropdown(null);
              }}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-primary/5 cursor-pointer transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-foreground">{d.name_th}</span>
                <span className="text-[8px] text-muted-foreground uppercase">{d.name_en} · {d.lat}, {d.lon}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* API Search Results (Fallback/Detailed) */}
      {openDropdown === "results" && results.length > 0 && (!localSuggestions.length || amphoe.length > 3) && (
        <ul className="absolute z-50 mt-1 w-[calc(100%-12px)] max-h-60 overflow-y-auto rounded-md border border-primary/30 bg-card shadow-2xl divide-y divide-border animate-in slide-in-from-top-2 duration-200 left-1.5">
          <li className="px-3 py-1 bg-primary/10 text-[8px] text-primary font-bold uppercase tracking-widest">
            {province ? `ผลลัพธ์ออนไลน์ใน${province}` : "ผลการค้นหาออนไลน์"}
          </li>
          {results.map((res, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(parseFloat(res.lat), parseFloat(res.lon), res.display_name);
                setAmphoe(res.display_name.split(",")[0]);
                setResults([]);
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
