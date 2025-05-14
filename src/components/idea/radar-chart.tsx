"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info, TrendingUp, Shield, Wrench, Zap, Target, BarChart3 } from 'lucide-react';

// Define score colors for consistency with enhanced gradient
const getScoreColor = (score: number) => {
  if (score <= 3) return 'rgba(239, 68, 68, 0.8)'; // red
  if (score <= 5) return 'rgba(245, 158, 11, 0.8)'; // amber
  if (score <= 7) return 'rgba(59, 130, 246, 0.8)'; // blue
  return 'rgba(34, 197, 94, 0.8)'; // green
};

// Get icon for each category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'market fit':
      return <Target className="h-4 w-4 text-blue-500" />;
    case 'uniqueness':
      return <Shield className="h-4 w-4 text-purple-500" />;
    case 'scalability':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'revenue':
      return <BarChart3 className="h-4 w-4 text-amber-500" />;
    case 'technical':
      return <Wrench className="h-4 w-4 text-indigo-500" />;
    case 'execution':
      return <Zap className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

type RadarChartProps = {
  pillars: Record<string, number>;
  title?: string;
  description?: string;
  showScore?: boolean;
  className?: string;
};

/**
 * A radar chart component that visualizes pillar scores with enhanced animations and tooltips
 */
export function RadarChart({ 
  pillars, 
  title = 'Validation Score Breakdown', 
  description = 'Assessment of key business viability pillars',
  showScore = true,
  className = ''
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState<{label: string; value: number; x: number; y: number} | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Calculate average score once
  const averageScore = Object.values(pillars).reduce((sum, val) => sum + val, 0) / Math.max(1, Object.values(pillars).length);
  
  useEffect(() => {
    if (!canvasRef.current || !pillars || Object.keys(pillars).length === 0) {
      return;
    }
    
    setIsLoading(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // For retina/high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set size back for normal display
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Sort keys to ensure consistent order
    const keys = Object.keys(pillars).sort();
    const values = keys.map(key => pillars[key]);
    const maxValue = 10; // Maximum value for normalization
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw fancy background effect
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.2);
    bgGradient.addColorStop(0, 'rgba(240, 249, 255, 0.2)');
    bgGradient.addColorStop(1, 'rgba(224, 242, 254, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    // Draw radar background circles
    for (let i = 1; i <= 5; i++) {
      const circleRadius = radius * (i / 5);
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.15)';
      ctx.lineWidth = i === 5 ? 1.5 : 1;
      ctx.stroke();
      
      // Add light labels for the grid circles
      if (i % 2 === 0 || i === 5) {
        ctx.fillStyle = 'rgba(107, 114, 128, 0.6)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i * 2}`, centerX, centerY - circleRadius - 5);
      }
    }
    
    // Draw radar lines (spokes)
    const totalFields = keys.length;
    const angleStep = (Math.PI * 2) / totalFields;
    
    for (let i = 0; i < totalFields; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top (subtract 90 degrees)
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Draw line from center to edge
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw label with enhanced styling
      const textDistance = radius * 1.1;
      const textX = centerX + textDistance * Math.cos(angle);
      const textY = centerY + textDistance * Math.sin(angle);
      
      ctx.save();
      ctx.font = 'bold 11px Inter, sans-serif';
      
      // Determine if the active category is being rendered
      const isActive = activeIndex === i;
      
      if (isActive) {
        ctx.fillStyle = 'rgba(59, 130, 246, 1)';
      } else {
        ctx.fillStyle = 'rgba(75, 85, 99, 0.9)';
      }
      
      // Position text properly based on angle
      ctx.textAlign = angle < -Math.PI / 4 || angle > Math.PI * 3/4 ? "right" : "left";
      ctx.textBaseline = angle > 0 && angle < Math.PI ? "top" : "bottom";
      
      // Draw label with subtle highlight for active element
      if (isActive) {
        // Draw highlight behind text
        const textWidth = ctx.measureText(keys[i]).width;
        const padding = 4;
        const bgX = textX + (ctx.textAlign === "right" ? -textWidth - padding : -padding);
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(
          bgX, 
          textY + (ctx.textBaseline === "top" ? -2 : -14),
          textWidth + padding * 2,
          18
        );
        
        ctx.fillStyle = 'rgba(59, 130, 246, 1)';
      }
      
      ctx.fillText(keys[i], textX, textY);
      ctx.restore();
    }
    
    // Calculate polygon points
    const points: Array<{x: number; y: number; value: number; label: string}> = [];
    for (let i = 0; i < totalFields; i++) {
      const value = values[i];
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const normalizedRadius = (value / maxValue) * radius;
      const x = centerX + normalizedRadius * Math.cos(angle);
      const y = centerY + normalizedRadius * Math.sin(angle);
      points.push({ x, y, value, label: keys[i] });
    }
    
    // Draw filled polygon with animated clip if not complete
    const drawPolygon = (progress = 1) => {
      ctx.save();
      
      if (!animationComplete) {
        // Create clipping region for animation
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius * 2, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      
      // Draw the actual polygon
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      
      // Create gradient fill
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
      gradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.7)');
      gradient.addColorStop(1, 'rgba(29, 78, 216, 0.4)');
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add stroke to polygon
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    };
    
    // If animation is complete, draw the full polygon
    if (animationComplete) {
      drawPolygon();
      
      // Draw glow effect
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 8;
      ctx.filter = 'blur(8px)';
      ctx.stroke();
      ctx.restore();
      
      // Draw data points on top
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const isActive = activeIndex === i;
        
        // Draw data point with visual enhancement for active state
        ctx.beginPath();
        ctx.arc(point.x, point.y, isActive ? 7 : 5, 0, Math.PI * 2);
        
        // Create radial gradient for point
        const pointGradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, isActive ? 7 : 5
        );
        pointGradient.addColorStop(0, getScoreColor(point.value));
        pointGradient.addColorStop(1, 'rgba(' + getScoreColor(point.value).slice(5, -4) + ', 0.6)');
        
        ctx.fillStyle = pointGradient;
        ctx.fill();
        
        // Add stroke to point
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw value next to point if showScore is true or point is active
        if (showScore || isActive) {
          ctx.fillStyle = isActive ? 'rgba(59, 130, 246, 1)' : 'rgba(55, 65, 81, 0.9)';
          ctx.font = isActive ? 'bold 14px Inter, sans-serif' : 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Position text with offset
          const angle = i * angleStep - Math.PI / 2;
          const textDistance = isActive ? 20 : 15;
          const textOffsetX = textDistance * Math.cos(angle);
          const textOffsetY = textDistance * Math.sin(angle);
          
          // Draw background behind the score for better readability
          if (isActive) {
            const scoreText = point.value.toString();
            const textWidth = ctx.measureText(scoreText).width;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillRect(
              point.x + textOffsetX - textWidth/2 - 4,
              point.y + textOffsetY - 8,
              textWidth + 8,
              16
            );
            ctx.fillStyle = 'rgba(59, 130, 246, 1)';
          }
          
          ctx.fillText(
            point.value.toString(), 
            point.x + textOffsetX, 
            point.y + textOffsetY
          );
        }
      }
    } else {
      // This will be handled by our animation
      drawPolygon(0);
    }
    
    // Store points for interaction handling
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is near any data point
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
          setActiveIndex(i);
          setTooltipContent({
            label: point.label,
            value: point.value,
            x: point.x,
            y: point.y
          });
          // Redraw with active indicator
          requestAnimationFrame(() => {
            if (canvasRef.current) {
              const newCtx = canvasRef.current.getContext('2d');
              if (newCtx && animationComplete) {
                newCtx.clearRect(0, 0, width, height);
                drawPolygon();
              }
            }
          });
          return;
        }
      }
      
      setActiveIndex(null);
      setTooltipContent(null);
      
      // Redraw without active indicator
      if (activeIndex !== null) {
        requestAnimationFrame(() => {
          if (canvasRef.current) {
            const newCtx = canvasRef.current.getContext('2d');
            if (newCtx && animationComplete) {
              newCtx.clearRect(0, 0, width, height);
              drawPolygon();
            }
          }
        });
      }
    };
    
    canvas.onmouseleave = () => {
      setActiveIndex(null);
      setTooltipContent(null);
      
      // Redraw without active indicator
      if (activeIndex !== null) {
        requestAnimationFrame(() => {
          if (canvasRef.current) {
            const newCtx = canvasRef.current.getContext('2d');
            if (newCtx && animationComplete) {
              newCtx.clearRect(0, 0, width, height);
              drawPolygon();
            }
          }
        });
      }
    };
    
    setIsLoading(false);
    
    // Animate the radar chart drawing
    if (!animationComplete) {
      let progress = 0;
      let lastTime = 0;
      
      const animate = (time: number) => {
        if (!lastTime) lastTime = time;
        const deltaTime = time - lastTime;
        lastTime = time;
        
        progress += deltaTime / 1000; // Convert to seconds
        const normalizedProgress = Math.min(progress / 1.5, 1); // Complete in 1.5 seconds
        
        if (canvasRef.current) {
          const animCtx = canvasRef.current.getContext('2d');
          if (animCtx) {
            animCtx.clearRect(0, 0, width, height);
            drawPolygon(normalizedProgress);
          }
        }
        
        if (normalizedProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimationComplete(true);
        }
      };
      
      requestAnimationFrame(animate);
    }
    
  }, [pillars, showScore, activeIndex, animationComplete]);
  
  const scoreDescription = (label: string, value: number) => {
    // Provide context based on score value and label
    if (label === 'Market Fit') {
      if (value <= 3) return 'Significant market challenges';
      if (value <= 5) return 'Moderate market alignment';
      if (value <= 7) return 'Good market opportunity';
      return 'Excellent product-market fit';
    }
    
    if (label === 'Uniqueness') {
      if (value <= 3) return 'Highly similar to existing solutions';
      if (value <= 5) return 'Some differentiating features';
      if (value <= 7) return 'Notable unique selling points';
      return 'Highly innovative solution';
    }
    
    if (label === 'Scalability') {
      if (value <= 3) return 'Challenging to scale';
      if (value <= 5) return 'Moderate scalability potential';
      if (value <= 7) return 'Good scaling potential';
      return 'Highly scalable business model';
    }
    
    if (label === 'Revenue') {
      if (value <= 3) return 'Limited revenue potential';
      if (value <= 5) return 'Moderate income prospects';
      if (value <= 7) return 'Strong revenue potential';
      return 'Exceptional monetization potential';
    }
    
    if (label === 'Technical') {
      if (value <= 3) return 'High technical complexity and challenges';
      if (value <= 5) return 'Moderate technical requirements';
      if (value <= 7) return 'Feasible technical implementation';
      return 'Technically straightforward to implement';
    }
    
    if (label === 'Execution') {
      if (value <= 3) return 'Difficult execution with many barriers';
      if (value <= 5) return 'Moderate execution challenges';
      if (value <= 7) return 'Good execution potential';
      return 'Straightforward path to execution';
    }
    
    // Default description
    if (value <= 3) return 'Needs significant improvement';
    if (value <= 5) return 'Average performance';
    if (value <= 7) return 'Good performance';
    return 'Excellent performance';
  };
  
  const getAverageScore = () => {
    if (!pillars || Object.keys(pillars).length === 0) return 0;
    
    const sum = Object.values(pillars).reduce((total, score) => total + score, 0);
    return sum / Object.keys(pillars).length;
  };
  
  const getScoreClass = (score: number) => {
    if (score <= 3) return 'text-red-500 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10';
    if (score <= 5) return 'text-amber-500 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10';
    if (score <= 7) return 'text-blue-500 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10';
    return 'text-green-500 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10';
  };
  
  const averageScoreRounded = Math.round(getAverageScore() * 10) / 10;
  
  return (
    <Card className={`overflow-hidden rounded-xl border shadow-md ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20 border-b">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl
            ${getScoreClass(averageScoreRounded)}`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              averageScoreRounded
            )}
          </motion.div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 pt-8 pb-8 flex flex-col items-center relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="relative w-full h-64 flex justify-center">
              <canvas ref={canvasRef} className="w-full h-full max-w-md" />
              
              {/* Enhanced tooltip */}
              <AnimatePresence>
                {tooltipContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]"
                    style={{
                      left: `${tooltipContent.x}px`,
                      top: `${tooltipContent.y - 100}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {getCategoryIcon(tooltipContent.label)}
                      <h3 className="font-semibold text-sm">{tooltipContent.label}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-sm font-bold px-2 py-0.5 rounded-md ${
                        getScoreClass(tooltipContent.value)
                      }`}>
                        Score: {tooltipContent.value}/10
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {scoreDescription(tooltipContent.label, tooltipContent.value)}
                    </p>
                    
                    {/* Tooltip arrow */}
                    <div 
                      className="absolute w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"
                      style={{
                        left: '50%',
                        bottom: '-8px',
                        marginLeft: '-6px',
                      }}
                    ></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Score legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mt-4">
              {Object.entries(pillars).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className={`flex items-center p-2 rounded-lg border ${
                    activeIndex === Object.keys(pillars).sort().indexOf(key)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                  }`}
                  onMouseEnter={() => {
                    const sortedIndex = Object.keys(pillars).sort().indexOf(key);
                    setActiveIndex(sortedIndex);
                    
                    // Find the coordinates for the tooltip
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const rect = canvas.getBoundingClientRect();
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const radius = Math.min(centerX, centerY) * 0.8;
                        
                        const totalFields = Object.keys(pillars).length;
                        const angleStep = (Math.PI * 2) / totalFields;
                        const angle = sortedIndex * angleStep - Math.PI / 2;
                        
                        const normalizedRadius = (value / 10) * radius;
                        const x = centerX + normalizedRadius * Math.cos(angle);
                        const y = centerY + normalizedRadius * Math.sin(angle);
                        
                        setTooltipContent({
                          label: key,
                          value,
                          x,
                          y
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    setActiveIndex(null);
                    setTooltipContent(null);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getCategoryIcon(key)}
                    <span className="text-sm font-medium">{key}</span>
                  </div>
                  <div className={`text-sm font-bold rounded-md px-2 ${getScoreClass(value)}`}>
                    {value}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
