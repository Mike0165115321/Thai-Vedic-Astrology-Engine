"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TopBar } from "@/components/astro/TopBar";
import { LeftPanel } from "@/components/astro/LeftPanel";
import { CenterPanel } from "@/components/astro/CenterPanel";
import { RightPanel } from "@/components/astro/RightPanel";
import { AIAssistant } from "@/components/astro/AIAssistant";
import { SettingsModal } from "@/components/astro/SettingsModal";
import { ChartData, BirthFormData } from "@/types/chart";

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [transitData, setTransitData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Natal" | "Synastry" | "Transit">("Natal");
  const [settings, setSettings] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const currentBirthData = useRef<BirthFormData | null>(null);
  const transitTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasMounted(true);
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

  const calculateInitialTransits = async (formData: BirthFormData) => {
    try {
      const response = await fetch("http://localhost:8000/calculate/chart", {
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

      // Calculate target date: Birth Date + Age (Years)
      // Note: Using a simple year addition. For high precision, we could use a library, 
      // but simple year addition is usually what's expected for Age transits.
      const targetDate = new Date(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute);
      
      // Add age in years (handling float for partial years)
      const daysToAdd = age * 365.25; 
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
        const response = await fetch("http://localhost:8000/calculate/chart", {
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

  if (!hasMounted) return null;

  const calculateChart = async (formData: BirthFormData) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/calculate/chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      setChartData(data);
      currentBirthData.current = formData;
    } catch (error) {
      console.error("Error calculating chart:", error);
      alert("Backend not connected? Make sure to run start-backend.bat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark flex h-screen flex-col overflow-hidden bg-background text-foreground font-sans">
      <TopBar onSettings={() => setSettings(true)} />
      
      <main className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: "20% 55% 25%" }}>
        <LeftPanel 
          mode={mode} 
          setMode={setMode} 
          onCalculate={calculateChart} 
          loading={loading}
        />
        
        <CenterPanel 
          chartData={chartData} 
          transitData={transitData}
          loading={loading}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
          onTransitDateChange={(dateOrAge) => {
             if (typeof dateOrAge === "number") {
                handleTransitAgeChange(dateOrAge);
             }
          }}
        />
        
        <RightPanel 
          chartData={chartData}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={setSelectedPlanet}
        />
      </main>

      <AIAssistant />
      
      {settings && <SettingsModal onClose={() => setSettings(false)} />}
      
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
