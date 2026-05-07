"use client";

import React, { useState } from "react";
import BirthForm from "@/components/forms/BirthForm";
import ZodiacWheel from "@/components/wheel/ZodiacWheel";
import { ChartData, BirthFormData } from "@/types/chart";

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);

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
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error("Error calculating chart:", error);
      alert("Backend not connected? Make sure to run start-backend.bat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <nav className="p-6 flex justify-between items-center relative z-10 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-widest bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AETOX ASTRO
        </h1>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">DASHBOARD</a>
          <a href="#" className="hover:text-white transition-colors">SETTINGS</a>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start">
            <h2 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              Unveil Your <span className="text-blue-500">Celestial</span> <br /> Blueprint.
            </h2>
            <p className="text-zinc-400 mb-10 max-w-md text-lg">
              Precision Thai-Vedic astrology engine powered by Swiss Ephemeris. 
              Get your sidereal chart, dasha, and divisional analysis in real-time.
            </p>
            <BirthForm onCalculate={calculateChart} />
          </div>

          <div className="flex justify-center items-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-blue-400 font-medium animate-pulse">Calculating Positions...</p>
              </div>
            ) : chartData ? (
              <div className="relative">
                <ZodiacWheel planets={chartData.planets} lagna={chartData.lagna} />
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-zinc-400 uppercase">Julian Date</p>
                    <p className="text-lg font-mono">{chartData.julian_date.toFixed(4)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-zinc-400 uppercase">Lagna Sign</p>
                    <p className="text-lg">{chartData.lagna.sign_index}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-[500px] h-[500px] rounded-full border border-white/5 flex items-center justify-center text-zinc-600 italic">
                Enter birth data to visualize the heavens
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
