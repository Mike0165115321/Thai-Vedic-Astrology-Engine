"use client";

import React, { useState } from 'react';
import { BirthFormData } from '@/types/chart';

interface BirthFormProps {
  onCalculate: (data: BirthFormData) => void;
}

export default function BirthForm({ onCalculate }: BirthFormProps) {
  const [formData, setFormData] = useState<BirthFormData>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    lat: 13.7367, // Bangkok
    lon: 100.5231
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Birth Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Day</label>
            <input 
              type="number" 
              value={formData.day} 
              onChange={e => setFormData({...formData, day: parseInt(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Month</label>
            <input 
              type="number" 
              value={formData.month} 
              onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Year</label>
            <input 
              type="number" 
              value={formData.year} 
              onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Hour</label>
            <input 
              type="number" 
              value={formData.hour} 
              onChange={e => setFormData({...formData, hour: parseInt(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Minute</label>
            <input 
              type="number" 
              value={formData.minute} 
              onChange={e => setFormData({...formData, minute: parseInt(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Latitude</label>
            <input 
              type="number" 
              step="any"
              value={formData.lat} 
              onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-zinc-400 uppercase mb-1">Longitude</label>
            <input 
              type="number" 
              step="any"
              value={formData.lon} 
              onChange={e => setFormData({...formData, lon: parseFloat(e.target.value)})}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transform transition-active active:scale-95"
        >
          Calculate Chart
        </button>
      </form>
    </div>
  );
}
