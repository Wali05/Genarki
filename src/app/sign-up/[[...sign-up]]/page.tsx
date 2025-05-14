"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "mx-auto"
              }
            }}
          />
        </motion.div>
      </div>
    </MainLayout>
  );
} 