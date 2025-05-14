"use client";

import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const toast = {
  default(props: ToastProps) {
    const { title, description, variant } = props;
    
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
      });
    } else {
      sonnerToast(title, {
        description,
      });
    }
  },
  
  error(title: string, description?: string) {
    sonnerToast.error(title, {
      description,
    });
  },
  
  success(title: string, description?: string) {
    sonnerToast.success(title, {
      description,
    });
  },
  
  info(title: string, description?: string) {
    sonnerToast.info(title, {
      description,
    });
  },
}; 