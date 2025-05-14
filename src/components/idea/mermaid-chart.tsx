"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

type MermaidTheme = "dark" | "default" | "forest" | "neutral" | "base";

interface MermaidChartProps {
  chart: string;
  config?: {
    theme?: MermaidTheme;
    backgroundColor?: string;
  };
}

export default function MermaidChart({ chart, config }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const renderChart = async () => {
      setIsRendered(false);
      setError(null);
      
      mermaid.initialize({
        startOnLoad: true,
        theme: config?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'default'),
        securityLevel: 'loose',
        fontFamily: 'inherit',
        logLevel: 3, // Reduce logging level to only show errors
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          useMaxWidth: false // Allows chart to expand beyond container
        },
        er: {
          useMaxWidth: false
        },
        gantt: {
          useMaxWidth: false
        }
      });
      
      if (containerRef.current) {
        try {
          // Reset container
          containerRef.current.innerHTML = chart;
          
          // Reset position and zoom when chart changes
          setPosition({ x: 0, y: 0 });
          setZoom(1);
          
          // Render mermaid diagram
          await mermaid.init(undefined, containerRef.current);
          setIsRendered(true);
          
          // Add interactive features to diagram nodes
          if (containerRef.current) {
            const nodes = containerRef.current.querySelectorAll('.node');
            nodes.forEach((node) => {
              node.classList.add('hover:shadow-lg', 'hover:scale-105', 'transition-all', 'duration-200');
              
              // Add subtle animation to nodes
              const rect = node.querySelector('rect');
              if (rect) {
                rect.setAttribute('rx', '6'); // Rounded corners
                rect.setAttribute('ry', '6');
                if (!rect.getAttribute('style')?.includes('fill:')) {
                  rect.setAttribute('style', rect.getAttribute('style') + ';fill:#f8fafc;stroke-width:2');
                }
              }
            });
            
            // Enhance edge paths
            const edges = containerRef.current.querySelectorAll('.edgePath');
            edges.forEach((edge) => {
              const path = edge.querySelector('path');
              if (path) {
                path.setAttribute('stroke-width', '2');
                path.classList.add('transition-all', 'duration-300');
              }
            });
          }
        } catch (err) {
          console.error("Error rendering mermaid chart:", err);
          setError("Error rendering diagram. Please check the syntax.");
          setIsRendered(true); // Set to true so controls still render
        }
      }
    };
    
    renderChart();
  }, [chart, config]);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleFullscreen = () => {
    if (chartContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        chartContainerRef.current.requestFullscreen();
      }
    }
  };
  
  return (
    <div 
      ref={chartContainerRef}
      className="relative overflow-hidden border rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4"
      style={{ minHeight: "300px" }}
    >
      {isRendered && !error && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            className="bg-white/90 dark:bg-gray-800/90 h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            className="bg-white/90 dark:bg-gray-800/90 h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="bg-white/90 dark:bg-gray-800/90 h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFullscreen}
            className="bg-white/90 dark:bg-gray-800/90 h-8 w-8 p-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-red-500 dark:text-red-400 text-center p-4">
            <p className="font-medium mb-2">{error}</p>
            <p className="text-sm">Try refreshing or check diagram syntax</p>
          </div>
        </div>
      )}
      
      <motion.div
        drag={isRendered && !error}
        dragConstraints={chartContainerRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        animate={isRendered ? { opacity: 1 } : { opacity: 0 }}
        style={{ 
          scale: zoom,
          x: position.x,
          y: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="flex justify-center items-center min-w-full min-h-[300px]"
      >
        <div className="relative">
          {isRendered && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 opacity-70">
              <Move className="h-3 w-3" /> Drag to move diagram
            </div>
          )}
          <div 
            ref={containerRef} 
            className="mermaid transition-all duration-200"
          >
            {chart}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 