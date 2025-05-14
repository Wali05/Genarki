"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeaknessContext, getWeaknessPriority } from "./idea-validation-helpers";

type ChallengeCardProps = {
  challenges: string[];
}

/**
 * Enhanced card component for displaying SaaS idea challenges
 */
export function ChallengeCard({ challenges }: ChallengeCardProps) {
  return (
    <Card className="overflow-hidden border-amber-100 dark:border-amber-900/30 transition-all duration-300 hover:shadow-md hover:shadow-amber-100 dark:hover:shadow-amber-900/20 group h-full">
      <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-transparent border-b border-amber-100 dark:border-amber-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-amber-300/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10"
        >
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
              <path d="M12 3c-1.1 0-2 .9-2 2v.5"></path>
              <path d="M10 9.5c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2z"></path>
            </svg>
            Challenges to Address
          </CardTitle>
          <CardDescription>
            Strategic considerations for product development
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="pt-6 relative">
        <div className="absolute right-0 top-0 h-full w-1 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors duration-300"></div>
        <ul className="space-y-3">
          {challenges?.map((challenge: string, index: number) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all duration-200 cursor-default relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="mt-0.5 relative z-10">
                <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
              </div>
              <div className="relative z-10">
                <p className="font-medium text-amber-900 dark:text-amber-200">{challenge}</p>
                <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mt-1">
                  {getWeaknessContext(challenge, index)}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Priority:</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                    {getWeaknessPriority(index)}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
