"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart } from "./radar-chart";
import { getScoreColorClass, getProgressColorClass } from "./idea-validation-helpers";

type IdeaScoreCardProps = {
  score: number;
  feedback?: string;
  pillars: Record<string, number>;
}

/**
 * Enhanced score card component for SaaS idea validation
 */
export function IdeaScoreCard({ score, feedback, pillars }: IdeaScoreCardProps) {
  return (
    <Card className="overflow-hidden border transition-all duration-300 hover:shadow-lg relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Overall Validation Score</CardTitle>
            <CardDescription>
              Comprehensive analysis of your SaaS idea across key dimensions
            </CardDescription>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
          >
            <span className="text-2xl font-bold text-white">{score}/10</span>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(pillars || {}).map(([key, value], idx) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <span className={`text-lg font-bold ${getScoreColorClass(Number(value))}`}>
                      {value}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Number(value) * 10}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${getProgressColorClass(Number(value))}`}
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Expert Analysis</h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                {feedback || "Your SaaS idea shows strong potential in the current market. With proper execution and strategic planning, this could become a successful product."}
              </motion.p>
            </div>
          </div>
          
          {/* Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <RadarChart pillars={pillars} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-500">{score}</div>
                  <div className="text-sm text-blue-500/80 font-medium">Overall Score</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
