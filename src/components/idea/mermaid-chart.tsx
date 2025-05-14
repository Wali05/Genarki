"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

type MermaidTheme = "dark" | "default" | "forest" | "neutral" | "base";

interface MermaidChartProps {
  chart: string;
  config?: {
    theme?: MermaidTheme;
  };
}

export default function MermaidChart({ chart, config }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: config?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'default'),
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
    
    if (containerRef.current) {
      try {
        containerRef.current.innerHTML = chart;
        mermaid.init(undefined, containerRef.current);
      } catch (error) {
        console.error("Error rendering mermaid chart:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error rendering diagram. Please check the syntax.</div>`;
        }
      }
    }
  }, [chart, config]);
  
  return (
    <div className="overflow-auto max-w-full">
      <div ref={containerRef} className="mermaid">
        {chart}
      </div>
    </div>
  );
} 