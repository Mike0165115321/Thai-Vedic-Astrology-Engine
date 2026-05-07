"use client";

import React from 'react';
import { Planet, Lagna } from '@/types/chart';

interface ZodiacWheelProps {
  planets: { [key: string]: Planet };
  lagna: Lagna | null;
}

export default function ZodiacWheel({ planets, lagna }: ZodiacWheelProps) {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const size = 500;
  const center = size / 2;
  const radius = size * 0.4;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
        {/* Outer Circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        
        {/* Sign Dividers */}
        {signs.map((sign, i) => {
          const angle = (i * 30) - 90; // Start from top
          const x1 = center + radius * Math.cos((angle * Math.PI) / 180);
          const y1 = center + radius * Math.sin((angle * Math.PI) / 180);
          const x2 = center + (radius - 20) * Math.cos((angle * Math.PI) / 180);
          const y2 = center + (radius - 20) * Math.sin((angle * Math.PI) / 180);
          
          return (
            <g key={sign}>
              <line x1={center} y1={center} x2={x1} y2={y1} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text 
                x={center + (radius + 25) * Math.cos(((angle + 15) * Math.PI) / 180)} 
                y={center + (radius + 25) * Math.sin(((angle + 15) * Math.PI) / 180)}
                fill="rgba(255,255,255,0.6)"
                fontSize="12"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        {/* Lagna (Ascendant) */}
        {lagna && (
          <line 
            x1={center} 
            y1={center} 
            x2={center + radius * Math.cos(((lagna.longitude - 90) * Math.PI) / 180)} 
            y2={center + radius * Math.sin(((lagna.longitude - 90) * Math.PI) / 180)} 
            stroke="#f59e0b" 
            strokeWidth="3"
            strokeDasharray="5,5"
          />
        )}

        {/* Planets */}
        {Object.entries(planets).map(([id, planet]) => {
          const angle = (planet.longitude - 90);
          const x = center + (radius * 0.7) * Math.cos((angle * Math.PI) / 180);
          const y = center + (radius * 0.7) * Math.sin((angle * Math.PI) / 180);
          
          return (
            <g key={id}>
              <circle cx={x} cy={y} r="15" fill="rgba(59, 130, 246, 0.5)" stroke="white" strokeWidth="1" />
              <text x={x} y={y} fill="white" fontSize="14" textAnchor="middle" alignmentBaseline="middle">
                {id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
