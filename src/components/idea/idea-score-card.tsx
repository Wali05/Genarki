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
    <Card className="overflow-hidden border-2 dark:border-neutral-800 transition-all duration-300 hover:shadow-2xl relative bg-white dark:bg-gray-900 transform hover:scale-[1.01]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-6 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Validation Score</CardTitle>
            <CardDescription className="text-base mt-2">
              Comprehensive analysis across key dimensions
            </CardDescription>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="flex items-center justify-center h-28 w-28 aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
            whileHover={{ scale: 1.08, rotate: 2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl font-bold text-white">{score}</span>
              <span className="text-sm text-blue-100">/10</span>
            </motion.div>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(pillars || {}).map(([key, value], idx) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
                  className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <span className={`text-lg font-bold ${getScoreColorClass(Number(value))}`}>
                      {value}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mt-2 overflow-hidden">
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
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Expert Analysis</h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-slate-700 dark:text-slate-300 leading-relaxed text-base"
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
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="rounded-xl aspect-square bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl p-6 border-2 border-gray-200 dark:border-gray-700"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.1, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                >
                  <div className="text-center">
                    <div className="text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-400 bg-clip-text text-transparent">{score}</div>
                    <div className="text-base text-neutral-500 dark:text-neutral-400 font-medium mt-2">Overall Score</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Add validation score breakdown section with better visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 pt-8 border-t-2 border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-semibold mb-6">Validation Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(pillars || {}).map(([key, value], idx) => (
              <motion.div
                key={`breakdown-${key}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium capitalize text-neutral-600 dark:text-neutral-300">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-xl font-bold ${getScoreColorClass(Number(value))}`}>
                    {value}
                  </span>
                </div>
                <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Number(value) * 10}%` }}
                    transition={{ delay: 1 + idx * 0.1, duration: 0.8 }}
                    className={`absolute h-full left-0 ${getProgressColorClass(Number(value))}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
