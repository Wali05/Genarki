"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HowItWorksCardProps {
  step: number;
  title: string;
  description: string;
  className?: string;
}

export function HowItWorksCard({ 
  step, 
  title, 
  description, 
  className 
}: HowItWorksCardProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleClick = () => {
    setIsSpinning(true);
    setIsDarkMode(!isDarkMode);
    setTimeout(() => setIsSpinning(false), 1000);
  };

  // Colors for the card border
  const colors = [
    "from-blue-500 to-blue-300",
    "from-purple-500 to-purple-300",
    "from-green-500 to-green-300",
    "from-amber-500 to-amber-300",
    "from-rose-500 to-rose-300",
    "from-cyan-500 to-cyan-300",
  ];

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-xl border h-full flex flex-col",
        isDarkMode 
          ? "bg-black text-white border-gray-800" 
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Animated border */}
      <motion.div 
        className={cn(
          "absolute inset-0 -z-10 rounded-xl bg-gradient-to-r opacity-0",
          colors[step % colors.length]
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.2 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated circle with step number */}
      <motion.div 
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-5",
          isDarkMode 
            ? "bg-white text-black" 
            : "bg-gradient-to-br from-blue-600 to-blue-400 text-white"
        )}
        animate={isSpinning ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {step}
      </motion.div>

      <motion.h3 
        className="text-xl font-bold mb-3"
        animate={isSpinning ? { y: [0, -10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h3>

      {/* Floating animated decoration elements */}
      <motion.div 
        className="absolute -z-10 right-6 top-20 w-20 h-20 rounded-full blur-2xl"
        initial={{ opacity: 0.1 }}
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          x: [0, 10, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{ 
          background: `linear-gradient(to right, ${isDarkMode ? '#3b82f6' : '#93c5fd'}, ${isDarkMode ? '#1d4ed8' : '#60a5fa'})` 
        }}
      />

      <p className={cn(
        "text-sm leading-relaxed flex-grow",
        isDarkMode ? "text-gray-300" : "text-muted-foreground"
      )}>
        {description}
      </p>
    </motion.div>
  );
} 