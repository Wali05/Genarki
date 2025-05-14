'use client';

import { useAuth, useUser } from '@clerk/nextjs';

// Client-side hook to get user ID
export function useCurrentUserId() {
  const { userId } = useAuth();
  return userId;
}

// Client-side hook to check if user is authenticated
export function useIsAuthenticated() {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && isSignedIn;
}

// Client-side hook to get user data
export function useUserData() {
  const { user, isLoaded } = useUser();
  return { user, isLoaded };
}

// Client-side hook to get Clerk JWT token for Supabase auth
export async function useClerkToken() {
  const { getToken } = useAuth();
  
  try {
    // Get the JWT token
    const token = await getToken();
    return token;
  } catch (error) {
    console.error('Error getting Clerk token:', error);
    return null;
  }
} 