"use client";

import { motion } from "framer-motion";

type RadarChartProps = {
  pillars: Record<string, number>;
  className?: string;
};

/**
 * A radar chart component that visualizes pillar scores
 */
export function RadarChart({ pillars, className = "" }: RadarChartProps) {
  // Calculate radar chart points based on pillar scores
  const calculateRadarPoints = (pillars: Record<string, number>) => {
    const values = Object.values(pillars);
    if (values.length === 0) return "50,50 50,50 50,50 50,50 50,50 50,50";
    
    // Ensure we have exactly 6 values for the hexagon
    const normalizedValues = values.length < 6 
      ? [...values, ...Array(6 - values.length).fill(7)] 
      : values.slice(0, 6);
    
    // Calculate points on the radar chart
    const center = 50;
    const points = normalizedValues.map((score, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      const normalizedScore = score / 10; // Normalize to 0-1 range
      const distance = 40 * normalizedScore; // 40 is max distance from center
      const x = center + distance * Math.sin(angle);
      const y = center - distance * Math.cos(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return points.join(" ");
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden ${className}`}>
      <div className="absolute -right-14 -top-14 w-28 h-28 bg-blue-500/10 rounded-full"></div>
      <div className="absolute -left-14 -bottom-14 w-28 h-28 bg-purple-500/10 rounded-full"></div>
      <div className="text-center p-4 md:p-8 space-y-6">
        <div className="relative inline-block">
          <svg className="w-full max-w-52 h-52" viewBox="0 0 100 100">
            {/* Radar chart background */}
            <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            <polygon points="50,20 80,50 50,80 20,50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            <polygon points="50,30 70,50 50,70 30,50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            <polygon points="50,40 60,50 50,60 40,50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
            
            {/* Radar chart data */}
            <motion.polygon 
              initial={{ opacity: 0, points: "50,50 50,50 50,50 50,50 50,50 50,50" }}
              animate={{ 
                opacity: 1,
                points: Object.values(pillars || {}).length > 0 ?
                  calculateRadarPoints(pillars || {}) : 
                  "50,20 80,50 50,80 20,50 30,30 70,30"
              }}
              transition={{ delay: 0.5, duration: 1 }}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            
            {/* Labels */}
            <text x="50" y="5" textAnchor="middle" fontSize="8" fill="currentColor">Uniqueness</text>
            <text x="95" y="50" textAnchor="start" fontSize="8" fill="currentColor">Market Fit</text>
            <text x="50" y="95" textAnchor="middle" fontSize="8" fill="currentColor">Growth Potential</text>
            <text x="5" y="50" textAnchor="end" fontSize="8" fill="currentColor">Pricing</text>
            <text x="30" y="25" textAnchor="middle" fontSize="8" fill="currentColor">Problem-Solution</text>
            <text x="70" y="25" textAnchor="middle" fontSize="8" fill="currentColor">Execution</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
