"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { getStrengthContext } from "./idea-validation-helpers";

type StrengthCardProps = {
  strengths: string[];
}

/**
 * Enhanced card component for displaying SaaS idea strengths
 */
export function StrengthCard({ strengths }: StrengthCardProps) {
  return (
    <Card className="overflow-hidden border-blue-100 dark:border-blue-900/30 transition-all duration-300 hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20 group h-full">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent border-b border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-300/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Check className="h-5 w-5 text-blue-500" />
            Strengths
          </CardTitle>
          <CardDescription>
            Key advantages that set your SaaS product idea apart
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="pt-6 relative">
        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300"></div>
        <ul className="space-y-3">
          {strengths?.map((strength: string, index: number) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-default relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="mt-0.5 relative z-10">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="font-medium text-blue-900 dark:text-blue-200">{strength}</p>
                <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-1">
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
