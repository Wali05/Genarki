"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
    // Reset back to original state after animation completes
    setTimeout(() => setIsClicked(false), 1000);
  };

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-xl border overflow-hidden group", 
        isClicked ? "bg-gradient-to-br from-blue-500 to-blue-400 text-white" : "bg-card hover:bg-card/80",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/30 dark:to-blue-900/10 opacity-0 -z-10"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div 
        className="absolute -z-10 right-0 bottom-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.3, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <div className="mb-4 flex items-center gap-3">
        <motion.div
          className="p-2 rounded-md bg-primary/10 text-primary"
          animate={isClicked ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <h3 className={cn(
          "font-semibold text-lg",
          isClicked ? "text-white" : "text-foreground"
        )}>
          {title}
        </h3>
      </div>
      
      <p className={cn(
        "text-sm leading-relaxed",
        isClicked ? "text-white" : "text-muted-foreground"
      )}>
        {description}
      </p>
    </motion.div>
  );
} 