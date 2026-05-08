"use client";
// Forced refresh for DASHA type sync

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TopBar } from "@/components/astro/TopBar";
import { LeftPanel, HistoryItem } from "@/components/astro/LeftPanel";
import { CenterPanel } from "@/components/astro/CenterPanel";
import { RightPanel } from "@/components/astro/RightPanel";
import { AIAssistant } from "@/components/astro/AIAssistant";
import { SettingsModal } from "@/components/astro/SettingsModal";
import { ChartData, BirthFormData, CompareResponse } from "@/types/chart";

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartType, setChartType] = useState<"D1" | "D3" | "D9" | "CAL">("D1");
  const [transitData, setTransitData] = useState<ChartData | null>(null);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Natal" | "Synastry" | "Transit">("Natal");
  const [settings, setSettings] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [synastryFocus, setSynastryFocus] = useState<"A" | "B" | "Both">("Both");
  const [hasMounted, setHasMounted] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [globalSettings, setGlobalSettings] = useState<Partial<BirthFormData>>({
    ayanamsa_mode: "LAHIRI",
    node_type: "TRUE",
    house_system: "Whole Sign",
    aspect_orb: 5
  });
  const currentBirthData = useRef<BirthFormData | null>(null);
  const transitTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasMounted(true);
    
    // Load history from backend
    const fetchHistory = async () => {
        try {
            const response = await fetch("http://localhost:8000/history/");
            if (response.ok) {
                const data = await response.json();
                // Map backend data to HistoryItem
                const mapped: HistoryItem[] = data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    date: `${item.day}/${item.month}/${item.year + 543}`,
                    loc: `${item.lat.toFixed(2)}, ${item.lon.toFixed(2)}`,
                    formData: {
                        name: item.name,
                        day: item.day,
                        month: item.month,
                        year: item.year,
                        hour: item.hour,
                        minute: item.minute,
                        lat: item.lat,
                        lon: item.lon,
                        timezone: item.timezone,
                        ayanamsa_mode: item.ayanamsa_mode,
                        custom_ayanamsa_offset: item.custom_ayanamsa_offset
                    }
                }));
                setHistory(mapped);
            }
        } catch (e) {
            console.error("Failed to load history from backend");
        }
    };
    fetchHistory();

    // Initial Transit Load
    const now = new Date();
    const initData: BirthFormData = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      lat: 13.7563, // Bangkok default
      lon: 100.5018,
      timezone: "Asia/Bangkok"
    };
    calculateInitialTransits(initData);
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("astro_history", JSON.stringify(newHistory));
  };

  const calculateInitialTransits = async (formData: BirthFormData) => {
    try {
      const response = await fetch("http://localhost:8000/calculate/chart/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        setTransitData(data);
        currentBirthData.current = formData;
      }
    } catch (e) {
      console.warn("Initial transit fetch failed. Is backend running?");
    }
  };

  // Age-based transit recalculation (debounced)
  const handleTransitAgeChange = useCallback((age: number) => {
    if (transitTimer.current) clearTimeout(transitTimer.current);
    transitTimer.current = setTimeout(async () => {
      const birth = currentBirthData.current;
      if (!birth) return;

      const targetDate = new Date(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute);
      const daysToAdd = age * 365.2422;
      targetDate.setTime(targetDate.getTime() + daysToAdd * 24 * 3600 * 1000);

      const formData: BirthFormData = {
        ...birth,
        day: targetDate.getDate(),
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        hour: targetDate.getHours(),
        minute: targetDate.getMinutes(),
      };
      
      try {
        const response = await fetch("http://localhost:8000/calculate/chart/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          const data = await response.json();
          setTransitData(data);
        }
      } catch (e) {
        console.warn("Age transit recalculation failed");
      }
    }, 400);
  }, []);

  // Helper to get divisional longitudes for rendering
  const getDivisionalData = useCallback((data: ChartData | null, type: string) => {
    if (!data) return null;
    if (type === "D1" || type === "CAL") return data;
    
    const divKey = type.toLowerCase() as "d3" | "d9";
    const divSource = data[divKey];
    if (!divSource) return data;

    const divPlanets: any = {};
    const multiplier = (type === "D3" ? 3 : 9);
    const divSize = 30 / multiplier;
    
    Object.keys(data.planets).forEach(name => {
        const divInfo = divSource[name];
        if (divInfo) {
            divPlanets[name] = { 
                ...data.planets[name], 
                sign: divInfo.sign,
                longitude: divInfo.longitude,
                dignity: divInfo.dignity || data.planets[name].dignity,
                dignity_list: divInfo.dignity_list || data.planets[name].dignity_list
            };
        } else {
            divPlanets[name] = data.planets[name];
        }
    });

    const lagnaKey = type.toLowerCase() + "_lagna" as "d3_lagna" | "d9_lagna";
    const divLagnaRaw = (data as any)[lagnaKey];
    let divLagna = data.lagna;
    
    if (divLagnaRaw) {
        divLagna = { 
            ...data.lagna, 
            sign: divLagnaRaw.sign, 
            longitude: divLagnaRaw.longitude 
        };
    }

    return { ...data, planets: divPlanets, lagna: divLagna };
  }, []);

  const displayChartData = useMemo(() => getDivisionalData(chartData, chartType), [chartData, chartType, getDivisionalData]);
  const displayTransitData = useMemo(() => getDivisionalData(transitData, chartType), [transitData, chartType, getDivisionalData]);

  const calculateChart = async (formData: BirthFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        ayanamsa_mode: formData.ayanamsa_mode || globalSettings.ayanamsa_mode,
        node_type: formData.node_type || globalSettings.node_type,
        house_system: formData.house_system || globalSettings.house_system,
        aspect_orb: formData.aspect_orb || globalSettings.aspect_orb
      };

      const response = await fetch("http://localhost:8000/calculate/chart/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setChartData(data);
      currentBirthData.current = formData;
      setTransitData(data);

      // Add to backend history
      await fetch("http://localhost:8000/history/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              name: formData.name || `ดวงชะตาใหม่`,
              ...formData
          })
      });
      
      // Refresh history list
      const histResp = await fetch("http://localhost:8000/history/");
      if (histResp.ok) {
          const histData = await histResp.json();
          const mapped: HistoryItem[] = histData.map((item: any) => ({
              id: item.id.toString(),
              name: item.name,
              date: `${item.day}/${item.month}/${item.year + 543}`,
              loc: `${item.lat.toFixed(2)}, ${item.lon.toFixed(2)}`,
              formData: { ...item, name: item.name }
          }));
          setHistory(mapped);
      }

    } catch (error) {
      console.error("Error calculating chart:", error);
      alert("Backend not connected? Make sure to run start-backend.bat");
    } finally {
      setLoading(false);
    }
  };

  const calculateCompare = async (dataA: BirthFormData, dataB: BirthFormData) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/calculate/compare/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_a: dataA, person_b: dataB }),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setCompareData(data);
      // For synastry, we use person_a as the primary chart for dasha etc if needed
      setChartData(data.person_a_chart);
    } catch (error) {
      console.error("Error calculating synastry:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="dark flex h-screen flex-col overflow-hidden bg-background text-foreground font-sans">
      <TopBar 
        onSettings={() => setSettings(true)} 
        currentChartType={chartType}
        onChartTypeChange={setChartType}
      />
      
      <main className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: "20% 55% 25%" }}>
        <LeftPanel 
          mode={mode} 
          setMode={setMode} 
          onCalculate={calculateChart} 
          onCalculateCompare={calculateCompare}
          loading={loading}
          history={history}
          onSelectHistory={(item) => {
              calculateChart(item.formData);
          }}
          onDeleteHistory={async (id) => {
              await fetch(`http://localhost:8000/history/${id}`, { method: "DELETE" });
              setHistory(history.filter(h => h.id !== id));
          }}
        />
        
        <CenterPanel 
          chartData={chartData}
          transitData={transitData}
          compareData={compareData}
          mode={mode}
          displayChartData={displayChartData}
          displayTransitData={displayTransitData}
          getDivisionalData={getDivisionalData}
          loading={loading}
          chartType={chartType}
          onAgeChange={handleTransitAgeChange}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
          synastryFocus={synastryFocus}
          setSynastryFocus={setSynastryFocus}
        />
        
        <RightPanel 
          chartData={displayChartData}
          compareData={compareData}
          mode={mode}
          chartType={chartType}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
          onAgeChange={handleTransitAgeChange}
        />
      </main>


      
      {settings && (
        <SettingsModal 
          onClose={() => setSettings(false)} 
          settings={globalSettings}
          onUpdate={(newSettings) => {
            setGlobalSettings(prev => ({ ...prev, ...newSettings }));
          }}
        />
      )}
      
      {/* Global Loading Overlay (Optional, or handled inside panels) */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium text-primary animate-pulse">Calculating Celestial Positions...</p>
          </div>
        </div>
      )}
    </div>
  );
}
