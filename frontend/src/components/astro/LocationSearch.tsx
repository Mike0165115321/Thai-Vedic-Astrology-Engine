"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Loader2, ChevronDown } from "lucide-react";
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
    return THAI_PROVINCES.filter(p => 
        p.name_th.includes(province) || 
        p.name_en.toLowerCase().includes(province.toLowerCase())
    ).slice(0, 8);
  }, [province]);

  const searchAmphoe = async () => {
    if (amphoe.length < 1) return;
    setLoading(true);
    try {
      // Use structured query with English province name for maximum reliability
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&accept-language=th,en`;
      
      const selectedP = THAI_PROVINCES.find(p => p.name_th === province);
      const pEn = selectedP ? selectedP.name_en : provinceEn;

      if (pEn) {
        url += `&state=${encodeURIComponent(pEn)}&county=${encodeURIComponent(amphoe)}&country=Thailand`;
      } else if (province) {
        url += `&state=${encodeURIComponent(province)}&county=${encodeURIComponent(amphoe)}&country=Thailand`;
      } else {
        url += `&q=${encodeURIComponent(amphoe + ", Thailand")}`;
      }

      const response = await fetch(url);
      let data = await response.json();
      
      // CRITICAL: Double-check filter in frontend
      if (province) {
        data = data.filter((res: any) => {
            const dn = res.display_name.toLowerCase();
            const p = province.toLowerCase();
            const pE = pEn ? pEn.toLowerCase() : "";
            return dn.includes(p) || (pE && dn.includes(pE));
        });
      }
      
      setResults(data);
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
    const timer = setTimeout(searchAmphoe, 600);
    return () => clearTimeout(timer);
  }, [amphoe, province]);

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <label className="text-[9px] uppercase text-muted-foreground mb-1 block">จังหวัด</label>
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
              className="w-full bg-input/50 border border-border rounded px-2 py-1.5 font-sans text-xs focus:ring-1 focus:ring-primary outline-none"
            />
            <ChevronDown className="absolute right-1.5 top-2 h-3 w-3 text-muted-foreground" />
          </div>
          {openDropdown === "province" && filteredProvinces.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-card shadow-2xl divide-y divide-border">
                {filteredProvinces.map(p => (
                    <li key={p.id} 
                        onClick={() => {
                            setProvince(p.name_th);
                            setProvinceEn(p.name_en);
                            setOpenDropdown(null);
                        }}
                        className="px-3 py-2 text-[10px] hover:bg-muted cursor-pointer transition-colors"
                    >
                        {p.name_th} <span className="text-muted-foreground ml-1">({p.name_en})</span>
                    </li>
                ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="text-[9px] uppercase text-muted-foreground mb-1 block">อำเภอ / เขต</label>
          <div className="relative">
            <input
              type="text"
              value={amphoe}
              onChange={(e) => setAmphoe(e.target.value)}
              onFocus={() => setOpenDropdown("results")}
              placeholder="ระบุอำเภอ..."
              className="w-full bg-input/50 border border-border rounded px-2 py-1.5 font-sans text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[10px] text-primary animate-pulse px-1 bg-primary/5 py-1 rounded">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>กำลังค้นหา "{amphoe}" เฉพาะในจังหวัด <span className="font-bold underline">{province || "..."}</span></span>
        </div>
      )}

      {openDropdown === "results" && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-[calc(100%-24px)] max-h-48 overflow-y-auto rounded-md border border-primary/30 bg-card shadow-2xl divide-y divide-border">
          <li className="px-3 py-1 bg-primary/10 text-[9px] text-primary font-bold uppercase tracking-widest">
            ผลลัพธ์ในจังหวัด{province}
          </li>
          {results.map((res, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(parseFloat(res.lat), parseFloat(res.lon), res.display_name);
                
                const addr = res.address;
                const p = addr.state || addr.province || "";
                const a = addr.city || addr.town || addr.village || addr.suburb || "";
                
                if (p) setProvince(p.replace("จังหวัด", "").trim());
                if (a) setAmphoe(a.replace("อำเภอ", "").replace("เขต", "").trim());
                
                setOpenDropdown(null);
              }}
              className="flex items-start gap-2 px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
            >
              <MapPin className="h-3 w-3 mt-0.5 text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-foreground">{res.display_name.split(",")[0]}</span>
                <span className="text-[9px] text-muted-foreground line-clamp-1">{res.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
