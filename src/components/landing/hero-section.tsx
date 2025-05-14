"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { Sparkles, ArrowRight } from "lucide-react";

export function HeroSection() {
  const { isLoaded, isSignedIn } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, opacity: number, size: number }>>([]);
  
  // Set up window size and create particles only on client side
  useEffect(() => {
    // Update window dimensions
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Create particles with client-side values
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 5 + 2
      }));
      setParticles(newParticles);
    };
    
    // Initial setup
    updateSize();
    generateParticles();
    
    // Listen for resize events
    window.addEventListener("resize", updateSize);
    
    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements and particles */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-3xl"
          style={{ 
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px)` 
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl"
          style={{ 
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)` 
          }}
        />
        
        {/* Floating particles */}
        {particles.map(({ id, x, y, opacity, size }) => (
          <motion.div
            key={id}
            className="absolute w-2 h-2 rounded-full bg-blue-400/40"
            initial={{ 
              x,
              y,
              opacity
            }}
            animate={{ 
              y: [
                y,
                Math.random() * windowSize.height,
                Math.random() * windowSize.height
              ]
            }}
            transition={{ 
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "mirror"
            }}
            style={{ 
              width: `${size}px`,
              height: `${size}px`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Beta Launch
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              Validate Your SaaS Ideas
            </span>
            <br />
            <span>Before Building Them</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Use AI to transform your SaaS concept into a validated business blueprint in 
            minutes, not months. Get comprehensive analysis, tech stack recommendations, 
            and execution plans.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-lg px-6 group"
            >
              <Link href={isLoaded && isSignedIn ? "/dashboard" : "/sign-up"}>
                {isLoaded && isSignedIn ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="border-blue-200 dark:border-blue-800 text-lg px-6"
            >
              <Link href="#how-it-works">
                How It Works
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 