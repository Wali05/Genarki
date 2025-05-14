"use client";

// Simple client-side authentication helpers

// Admin authentication
export function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In a real app, these would be securely stored or validated via an API
    const adminUsername = 'admin';
    const adminPassword = 'password123';
    
    // Simulate a network request
    setTimeout(() => {
      resolve(username === adminUsername && password === adminPassword);
    }, 500);
  });
}

// Client-side cookie management
export function setAuthCookie(token: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
  }
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  
  if (!authCookie) return null;
  
  return authCookie.split('=')[1].trim();
}

export function removeAuthCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth-token=; path=/; max-age=0';
  }
}

// For development purposes
export function getCurrentUserId(): string {
  return 'dev-user-123';
} 