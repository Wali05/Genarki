import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href: string;
  label?: string;
  variant?: "default" | "primary" | "ghost";
}

export function BackButton({ href, label = "Back", variant = "default" }: BackButtonProps) {
  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-transparent dark:from-blue-700 dark:to-blue-500 shadow-md hover:shadow-lg hover:shadow-blue-100/40 dark:hover:shadow-blue-900/20";
      case "ghost":
        return "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent";
      default:
        return "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md";
    }
  };

  return (
    <motion.div
      className="inline-block"
      whileHover={{ scale: 1.05, x: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <Link
        href={href}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${getButtonStyles()}`}
      >
        <motion.div
          className="relative"
          initial={{ x: 0 }}
          animate={{ x: [0, -3, 0] }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            repeatDelay: 2
          }}
        >
          <div className="absolute top-0 left-0 w-6 h-6 bg-blue-400/10 dark:bg-blue-500/20 rounded-full scale-0 animate-ping" style={{ animationDuration: '3s' }}></div>
          <ArrowLeft className="h-4 w-4 relative z-10" />
        </motion.div>
        <span className="font-medium">{label}</span>
      </Link>
    </motion.div>
  );
} 