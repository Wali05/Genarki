"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" closeButton richColors />
      </ThemeProvider>
    </ClerkProvider>
  );
} 