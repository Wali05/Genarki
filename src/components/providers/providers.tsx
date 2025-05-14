"use client";

import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" closeButton richColors />
      </ThemeProvider>
    </AuthProvider>
  );
} 