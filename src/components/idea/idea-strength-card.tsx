"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Shield, TrendingUp, Award, Zap } from "lucide-react";
import { getStrengthContext } from "./idea-validation-helpers";

type StrengthCardProps = {
  strengths: string[];
}

// Function to get different icons for variety
const getStrengthIcon = (index: number) => {
  const icons = [
    <Check key="check" className="h-4 w-4 text-blue-500" />,
    <Star key="star" className="h-4 w-4 text-yellow-500" />,
    <Shield key="shield" className="h-4 w-4 text-green-500" />,
    <TrendingUp key="trending" className="h-4 w-4 text-purple-500" />,
    <Award key="award" className="h-4 w-4 text-pink-500" />,
    <Zap key="zap" className="h-4 w-4 text-indigo-500" />
  ];
  
  return icons[index % icons.length];
};

/**
 * Enhanced card component for displaying SaaS idea strengths
 */
export function StrengthCard({ strengths }: StrengthCardProps) {
  return (
    <Card className="overflow-hidden border-blue-100 dark:border-blue-900/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/40 dark:hover:shadow-blue-900/20 group h-full relative bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-900/5">
      {/* Decorative accent corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-blue-500/5 rounded-bl-[40px] transform -translate-y-2 translate-x-2"></div>
      
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent border-b border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-300/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="relative z-10"
        >
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-800/40 shadow-inner">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 3
                }}
              >
                <Check className="h-4 w-4 text-blue-500" />
              </motion.div>
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Key Strengths</span>
          </CardTitle>
          <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
            Compelling advantages that set your SaaS product apart
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="pt-6 relative">
        <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-400/30 via-blue-500/10 to-blue-400/5"></div>
        <ul className="space-y-4">
          {strengths?.map((strength: string, index: number) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.02, 
                x: 5,
                transition: { 
                  duration: 0.2
                }
              }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-default relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="mt-0.5 relative z-10">
                <motion.div 
                  className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: ["hsl(210, 100%, 95%)", "hsl(220, 100%, 90%)"],
                    transition: { duration: 0.2 }
                  }}
                >
                  {getStrengthIcon(index)}
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    initial={{ boxShadow: "0 0 0px rgba(37, 99, 235, 0)" }}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(37, 99, 235, 0)", "0 0 8px rgba(37, 99, 235, 0.3)", "0 0 0px rgba(37, 99, 235, 0)"] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                </motion.div>
              </div>
              <div className="relative z-10">
                <p className="font-semibold text-blue-900 dark:text-blue-200">{strength}</p>
                <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-1.5">
                  {getStrengthContext(strength, index)}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
