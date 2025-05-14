"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PricingSection() {
  const [isHovered, setIsHovered] = useState(false);
  
  const features = [
    "Unlimited idea validation",
    "AI-powered business analysis",
    "Six-pillar validation framework",
    "Comprehensive blueprint generation",
    "Technology stack recommendations",
    "User flow diagrams",
    "Kanban project management",
    "Market validation insights",
    "Business model canvas",
    "Competitive analysis",
  ];
  
  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl dark:bg-blue-900/40" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-300 rounded-full blur-3xl dark:bg-purple-900/40" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Currently in beta, Genarki is completely free while we refine our platform.
            Join us now to lock in these benefits before we launch paid plans.
          </motion.p>
        </div>
        
        <div className="flex justify-center">
          <motion.div 
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-2xl shadow-lg overflow-hidden max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ 
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Popular badge */}
            <div className="relative">
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  BETA
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 py-6"
                >
                  <Link href="/sign-up">
                    Get Started — It's Free
                  </Link>
                </Button>
              </motion.div>
              
              <div className="mt-6 pt-6 border-t">
                <p className="font-medium mb-4">Everything included:</p>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.4 + (index * 0.07)
                      }}
                    >
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Animated decorations */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 opacity-70"
              animate={{ 
                backgroundPosition: isHovered ? ['0% 50%', '100% 50%'] : '0% 50%' 
              }}
              transition={{ 
                duration: 2, 
                repeat: isHovered ? Infinity : 0,
                repeatType: "reverse"
              }}
              style={{ backgroundSize: '200% 100%' }}
            />
          </motion.div>
        </div>
        
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
        >
          Have questions? <a href="#contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact our team</a>
        </motion.p>
      </div>
    </section>
  );
} 