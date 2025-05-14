"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PillarCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  className?: string;
}

export function PillarCard({ title, description, icon: Icon, index, className }: PillarCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isClicked, setIsClicked] = useState(false);
  
  const controls = useAnimation();
  
  // Colors for the glowing effect
  const colors = [
    ["#3b82f6", "#60a5fa"], // blue
    ["#8b5cf6", "#a78bfa"], // purple
    ["#10b981", "#34d399"], // green
    ["#f59e0b", "#fbbf24"], // amber
    ["#ef4444", "#f87171"], // red
    ["#06b6d4", "#22d3ee"], // cyan
  ];
  
  const [color1, color2] = colors[index % colors.length];
  
  // Handle mouse movement for the 3D effect
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate normalized mouse position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update motion values
    mouseX.set(x);
    mouseY.set(y);
    
    // Calculate rotation (max 10 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 5; // max 5 degrees
    const rotateX = ((centerY - y) / centerY) * 5; // max 5 degrees
    
    // Apply the rotation
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
  
  function handleMouseLeave() {
    setIsHovered(false);
    
    // Reset rotation
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  }
  
  const handleClick = () => {
    setIsClicked(true);
    controls.start({
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 }
    });
    
    // Reset the clicked state after animation
    setTimeout(() => setIsClicked(false), 500);
  };
  
  // Reset the card when component unmounts
  useEffect(() => {
    return () => {
      if (cardRef.current) {
        cardRef.current.style.transform = 'none';
      }
    };
  }, []);
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative p-6 rounded-xl border h-full flex flex-col overflow-hidden cursor-pointer transform-gpu",
        isClicked
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white border-blue-500"
          : "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/80 border-gray-200 dark:border-gray-800",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1
      }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      animate={controls}
      style={{ 
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        transition: 'transform 0.2s ease-out'
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -z-10 inset-0 opacity-0 blur-xl"
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, ${color1}, transparent 60%)`
        }}
      />
      
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-blue-500/30 dark:bg-blue-400/30"
          initial={{ 
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 0
          }}
          animate={{ 
            x: [
              Math.random() * 100,
              Math.random() * 100,
              Math.random() * 100
            ],
            y: [
              Math.random() * 100,
              Math.random() * 100,
              Math.random() * 100
            ],
            opacity: isHovered ? 1 : 0
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
      
      <div className="mb-4 flex items-center gap-3">
        <motion.div
          className={cn(
            "p-2 rounded-md text-blue-600 dark:text-blue-400",
            isClicked ? "bg-white text-blue-600" : "bg-blue-100 dark:bg-blue-900/30"
          )}
          whileHover={{ rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          animate={isClicked ? { rotate: 360 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
        <h3 className={cn(
          "font-bold text-lg",
          isClicked ? "text-white" : "text-foreground"
        )}>
          {title}
        </h3>
      </div>
      
      <p className={cn(
        "text-sm leading-relaxed flex-grow",
        isClicked ? "text-blue-100" : "text-muted-foreground"
      )}>
        {description}
      </p>
      
      <motion.div 
        className="mt-4 bg-blue-50 dark:bg-blue-900/20 h-1.5 rounded-full overflow-hidden"
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
          initial={{ width: "20%" }}
          animate={{ width: isHovered ? "80%" : "40%" }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </motion.div>
  );
} 