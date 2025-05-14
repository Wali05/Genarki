"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container px-4 py-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link 
            href="/" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to home</span>
          </Link>
        </motion.div>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto shadow-xl rounded-xl",
                card: "mx-auto p-8",
                headerTitle: "text-2xl font-semibold",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-500"
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
} 