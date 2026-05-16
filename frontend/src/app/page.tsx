"use client";
// Forced refresh for DASHA type sync

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TopBar } from "@/components/astro/TopBar";
import { LeftPanel, HistoryItem } from "@/components/astro/LeftPanel";
import { CenterPanel } from "@/components/astro/CenterPanel";
import { RightPanel } from "@/components/astro/RightPanel";
import { AIAssistant } from "@/components/astro/AIAssistant";
import { SettingsModal } from "@/components/astro/SettingsModal";
import { TransitScannerModal } from "@/components/astro/TransitScannerModal";
import { ExportNatalModal, ExportConfig } from "@/components/astro/ExportNatalModal";
import TransitReport from "@/components/astro/TransitReport";
import { ChartData, BirthFormData, CompareResponse } from "@/types/chart";
import { TransitTimelineReport } from "@/components/astro/TransitTimelineReport";
import { API_ENDPOINTS } from "@/config/api";
import { generateNatalMarkdown, generateTransitMarkdown, downloadMarkdown } from "@/lib/markdownExport";


export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartType, setChartType] = useState<"D1" | "D3" | "D9" | "CAL">("D1");
  const [transitData, setTransitData] = useState<ChartData | null>(null);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Natal" | "Synastry" | "Transit">("Natal");
  const [settings, setSettings] = useState(false);
  const [exportModal, setExportModal] = useState(false); // Transit Scanner
  const [natalExportModal, setNatalExportModal] = useState(false); // Natal Export
  const [exportConfig, setExportConfig] = useState<ExportConfig | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [synastryFocus, setSynastryFocus] = useState<"A" | "B" | "Both">("Both");
  const [hasMounted, setHasMounted] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [globalSettings, setGlobalSettings] = useState<Partial<BirthFormData>>({
    ayanamsa_mode: "HYBRID",
    node_type: "TRUE",
    ketu_mode: "vedic",
    house_system: "Whole Sign",
    aspect_orb: 5,
    planet_corrections: {
      "Sun": 0.0, "Moon": 0.0, "Mars": 0.0, "Mercury": 0.0,
      "Jupiter": 0.0, "Venus": 0.0, "Saturn": 0.0, "Rahu": 0.0, "Ketu": 0.0
    }
  });
  const currentBirthData = useRef<BirthFormData | null>(null);
  const transitTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasMounted(true);
    
    // Load history from backend
    const fetchHistory = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.HISTORY);
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
                        node_type: item.node_type,
                        ketu_mode: item.ketu_mode
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
      const response = await fetch(API_ENDPOINTS.CALCULATE_CHART, {
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
        const response = await fetch(API_ENDPOINTS.CALCULATE_CHART, {
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

  // Auto-recalculate when settings change
  useEffect(() => {
    if (currentBirthData.current) {
      calculateChart(currentBirthData.current);
    }
  }, [globalSettings.ayanamsa_mode, globalSettings.node_type, globalSettings.ketu_mode, globalSettings.house_system, globalSettings.planet_corrections]);

  // Auto-sync to current time when entering Transit mode
  useEffect(() => {
    if (mode === "Transit" && currentBirthData.current) {
        const birth = currentBirthData.current;
        const now = new Date();
        const birthDate = new Date(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute);
        const diffMs = now.getTime() - birthDate.getTime();
        const diffDays = diffMs / (1000 * 3600 * 24);
        const currentAge = diffDays / 365.2422;
        
        handleTransitAgeChange(Math.max(0, currentAge));
    }
  }, [mode, handleTransitAgeChange]);

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

    const lordsKey = type.toLowerCase() + "_house_lords" as "d3_house_lords" | "d9_house_lords";
    const divLords = (data as any)[lordsKey] || data.house_lords;

    const yogasKey = type.toLowerCase() + "_yogas" as "d3_yogas" | "d9_yogas";
    const divYogas = (data as any)[yogasKey] || data.yogas;

    const aspectsKey = type.toLowerCase() + "_western_aspects" as "d3_western_aspects" | "d9_western_aspects";
    const divAspects = (data as any)[aspectsKey] || data.western_aspects;

    return { 
        ...data, 
        planets: divPlanets, 
        lagna: divLagna, 
        house_lords: divLords, 
        yogas: divYogas,
        western_aspects: divAspects
    };
  }, []);

  const displayChartData = useMemo(() => getDivisionalData(chartData, chartType), [chartData, chartType, getDivisionalData]);
  const displayTransitData = useMemo(() => getDivisionalData(transitData, chartType), [transitData, chartType, getDivisionalData]);
  const displayCompareDataB = useMemo(() => compareData ? getDivisionalData(compareData.person_b_chart, chartType) : null, [compareData, chartType, getDivisionalData]);

  const calculateChart = async (formData: BirthFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        ayanamsa_mode: globalSettings.ayanamsa_mode,
        node_type: globalSettings.node_type,
        ketu_mode: globalSettings.ketu_mode,
        house_system: globalSettings.house_system,
        aspect_orb: globalSettings.aspect_orb,
        planet_corrections: globalSettings.planet_corrections
      };

      const response = await fetch(API_ENDPOINTS.CALCULATE_CHART, {
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
      await fetch(API_ENDPOINTS.HISTORY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              name: formData.name || `ดวงชะตาใหม่`,
              ...formData
          })
      });
      
      // Refresh history list
      const histResp = await fetch(API_ENDPOINTS.HISTORY);
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
      const payloadA = {
        ...dataA,
        ayanamsa_mode: globalSettings.ayanamsa_mode,
        node_type: globalSettings.node_type,
        ketu_mode: globalSettings.ketu_mode,
        house_system: globalSettings.house_system,
        aspect_orb: globalSettings.aspect_orb,
        planet_corrections: globalSettings.planet_corrections
      };
      const payloadB = {
        ...dataB,
        ayanamsa_mode: globalSettings.ayanamsa_mode,
        node_type: globalSettings.node_type,
        ketu_mode: globalSettings.ketu_mode,
        house_system: globalSettings.house_system,
        aspect_orb: globalSettings.aspect_orb,
        planet_corrections: globalSettings.planet_corrections
      };
      
      const response = await fetch(API_ENDPOINTS.CALCULATE_COMPARE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_a: payloadA, person_b: payloadB }),
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

  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);

  const handleExportScanner = async (config: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSIT_SCANNER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Always show the Timeline Report (user can download JSON/ICS inside the report)
        setTimelineData(data);
        setExportModal(false);
      } else {
        alert("Failed to generate scan report");
      }
    } catch (e) {
      console.error("Scanner error:", e);
    }
  };

  const handleExportNatal = (config: ExportConfig) => {
    if (!chartData) return;

    if (config.format === 'JSON') {
        const exportData = {
            type: "NATAL_REPORT",
            name: currentBirthData.current?.name || "ไม่ระบุชื่อ",
            birth_data: currentBirthData.current,
            chart_data: chartData,
            config: config,
            exported_at: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const firstName = exportData.name.split(" ")[0];
        const fileName = `Natal_${firstName}_${new Date().getTime()}.json`;
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setNatalExportModal(false);
    } else if (config.format === 'MD') {
        const birth = currentBirthData.current;
        const name = birth?.name || "ดวงชะตา";
        const firstName = name.split(" ")[0];
        const mdContent = generateNatalMarkdown(
            { ...chartData, name },
            birth,
            config
        );
        downloadMarkdown(mdContent, `Natal_${firstName}_${new Date().getTime()}.md`);
        setNatalExportModal(false);
    } else {
        // PDF format: Construct a complete report data object with metadata
        const birth = currentBirthData.current;
        const formattedDate = birth ? `${birth.day}/${birth.month}/${birth.year + 543} เวลา ${String(birth.hour).padStart(2, '0')}:${String(birth.minute).padStart(2, '0')} น.` : "-";
        const formattedLoc = birth ? (birth.location || `${birth.lat.toFixed(4)}, ${birth.lon.toFixed(4)}`) : "-";

        setReportData({
            natal_chart: {
                ...chartData,
                name: birth?.name || "ไม่ระบุชื่อ",
                birth_date: formattedDate,
                location: formattedLoc
            }
        });
        setExportConfig(config);
        setShowReport(true);
        setNatalExportModal(false);
    }
  };

  const handleExportTransitMD = () => {
    if (!transitData) return;
    const name = currentBirthData.current?.name || "ดาวจร";
    const firstName = name.split(" ")[0];
    const mdContent = generateTransitMarkdown(transitData, new Date());
    downloadMarkdown(mdContent, `Transit_${firstName}_${new Date().getTime()}.md`);
  };

  if (!hasMounted) return null;

  return (
    <div className="dark flex h-screen flex-col overflow-hidden bg-background text-foreground font-sans">
      <TopBar 
        onSettings={() => setSettings(true)} 
        onTransitScan={() => setExportModal(true)}
        onExportNatal={() => setNatalExportModal(true)}
        onExportTransitMD={handleExportTransitMD}
        currentChartType={chartType}
        onChartTypeChange={setChartType}
      />
      
      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Panel (Sliding Drawer) */}
        <div 
          className="h-full shrink-0 border-r border-border/40 bg-background transition-all duration-500 ease-in-out z-20 overflow-hidden"
          style={{ width: showLeftPanel ? "280px" : "0px" }}
        >
          <div 
            className="w-[280px] h-full transition-transform duration-500 ease-in-out"
            style={{ transform: showLeftPanel ? "translateX(0)" : "translateX(-100%)" }}
          >
            <LeftPanel 
              mode={mode} 
              setMode={setMode} 
              onCalculate={calculateChart} 
              onCalculateCompare={calculateCompare}
              loading={loading}
              history={history}
              onSelectHistory={(item, isB) => {
                  if (isB) {
                      // Just update form, don't trigger single calculation
                      return;
                  }
                  calculateChart(item.formData);
              }}
              onDeleteHistory={async (id) => {
                  await fetch(`${API_ENDPOINTS.HISTORY}${id}`, { method: "DELETE" });
                  setHistory(history.filter(h => h.id !== id));
              }}
            />
          </div>
        </div>
        
        {/* Center Panel */}
        <div className="flex-1 h-full relative z-10 overflow-hidden bg-black/20">
          <CenterPanel 
            chartData={chartData}
            transitData={transitData}
            compareData={compareData}
            mode={mode}
            displayChartData={displayChartData}
            displayTransitData={displayTransitData}
            displayCompareDataB={displayCompareDataB}
            getDivisionalData={getDivisionalData}
            loading={loading}
            chartType={chartType}
            onAgeChange={handleTransitAgeChange}
            selectedPlanet={selectedPlanet}
            onSelectPlanet={setSelectedPlanet}
            synastryFocus={synastryFocus}
            setSynastryFocus={setSynastryFocus}
          />
          
          {/* Left Panel Toggle Button */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 flex h-14 w-5 items-center justify-center rounded-r-md border border-l-0 border-border bg-card/90 text-muted-foreground hover:bg-primary hover:text-black transition-all shadow-[5px_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md"
            title={showLeftPanel ? "พับแผงด้านซ้าย" : "แสดงแผงด้านซ้าย"}
          >
            {showLeftPanel ? (
              <span className="text-[10px]">◀</span>
            ) : (
              <span className="text-[10px]">▶</span>
            )}
          </button>

          {/* Right Panel Toggle Button */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 flex h-14 w-5 items-center justify-center rounded-l-md border border-r-0 border-border bg-card/90 text-muted-foreground hover:bg-primary hover:text-black transition-all shadow-[-5px_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md"
            title={showRightPanel ? "พับแผงด้านขวา" : "แสดงแผงด้านขวา"}
          >
            {showRightPanel ? (
              <span className="text-[10px]">▶</span>
            ) : (
              <span className="text-[10px]">◀</span>
            )}
          </button>
        </div>
        
        {/* Right Panel (Sliding Drawer) */}
        <div 
          className="h-full shrink-0 border-l border-border/40 bg-background transition-all duration-500 ease-in-out z-20 overflow-hidden"
          style={{ width: showRightPanel ? "340px" : "0px" }}
        >
          <div 
            className="w-[340px] h-full transition-transform duration-500 ease-in-out"
            style={{ transform: showRightPanel ? "translateX(0)" : "translateX(100%)" }}
          >
            <RightPanel 
              chartData={displayChartData}
              transitData={displayTransitData}
              compareData={compareData}
              displayCompareDataB={displayCompareDataB}
              mode={mode}
              chartType={chartType}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={setSelectedPlanet}
              onAgeChange={handleTransitAgeChange}
            />
          </div>
        </div>
      </main>


      
      {exportModal && (
        <TransitScannerModal 
          onClose={() => setExportModal(false)} 
          history={history}
          currentNatalData={currentBirthData.current}
          onGenerate={handleExportScanner}
        />
      )}

      {natalExportModal && (
        <ExportNatalModal 
          onClose={() => setNatalExportModal(false)}
          chartName={currentBirthData.current?.name || "ดวงชะตา"}
          onExport={handleExportNatal}
        />
      )}

      {settings && (
        <SettingsModal 
          onClose={() => setSettings(false)} 
          settings={globalSettings}
          onUpdate={(newSettings) => {
            setGlobalSettings(prev => ({ ...prev, ...newSettings }));
          }}
        />
      )}

      {showReport && (
        <TransitReport 
          data={reportData} 
          onClose={() => {
            setShowReport(false);
            setExportConfig(null);
          }} 
          config={exportConfig || undefined}
        />
      )}

      {timelineData && (
        <TransitTimelineReport 
          data={timelineData} 
          onClose={() => setTimelineData(null)} 
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
