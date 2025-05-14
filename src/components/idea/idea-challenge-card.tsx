"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Lightbulb, Flag, Gauge, BarChart } from "lucide-react";
import { getWeaknessContext, getWeaknessPriority } from "./idea-validation-helpers";

type ChallengeCardProps = {
  challenges: string[];
}

// Function to get different icons for variety
const getChallengeIcon = (index: number) => {
  const icons = [
    <AlertTriangle key="alert" className="h-4 w-4 text-amber-500" />,
    <AlertCircle key="circle" className="h-4 w-4 text-orange-500" />,
    <Lightbulb key="lightbulb" className="h-4 w-4 text-yellow-500" />,
    <Flag key="flag" className="h-4 w-4 text-rose-500" />,
    <Gauge key="gauge" className="h-4 w-4 text-red-500" />,
    <BarChart key="chart" className="h-4 w-4 text-amber-600" />
  ];
  
  return icons[index % icons.length];
};

/**
 * Enhanced card component for displaying SaaS idea challenges
 */
export function ChallengeCard({ challenges }: ChallengeCardProps) {
  return (
    <Card className="overflow-hidden border-amber-100 dark:border-amber-900/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/40 dark:hover:shadow-amber-900/20 group h-full relative bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-900 dark:to-amber-900/5">
      {/* Decorative accent corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-amber-500/5 rounded-bl-[40px] transform -translate-y-2 translate-x-2"></div>
      
      <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-transparent border-b border-amber-100 dark:border-amber-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-amber-300/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2 
          }}
          className="relative z-10"
        >
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-800/40 shadow-inner">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 3
                }}
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </motion.div>
            </div>
            <span className="font-bold bg-gradient-to-r from-amber-700 to-amber-500 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">Challenges to Address</span>
          </CardTitle>
          <CardDescription className="text-amber-600/70 dark:text-amber-400/70">
            Strategic considerations for successful implementation
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="pt-6 relative">
        <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400/30 via-amber-500/10 to-amber-400/5"></div>
        <ul className="space-y-4">
          {challenges?.map((challenge: string, index: number) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.1 + 0.2,
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
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-50/80 dark:hover:bg-amber-900/20 transition-all duration-200 cursor-default relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="mt-0.5 relative z-10">
                <motion.div 
                  className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-sm"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: ["hsl(43, 100%, 95%)", "hsl(38, 100%, 90%)"],
                    transition: { duration: 0.2 }
                  }}
                >
                  {getChallengeIcon(index)}
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    initial={{ boxShadow: "0 0 0px rgba(245, 158, 11, 0)" }}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 8px rgba(245, 158, 11, 0.3)", "0 0 0px rgba(245, 158, 11, 0)"] 
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
                <p className="font-semibold text-amber-900 dark:text-amber-200">{challenge}</p>
                <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mt-1.5">
                  {getWeaknessContext(challenge, index)}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Priority:</span>
                  <motion.span 
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {getWeaknessPriority(index)}
                  </motion.span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
