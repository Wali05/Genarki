import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Sets up Supabase client with Clerk user's JWT token
 * Call this before making Supabase requests in authenticated contexts
 */
export const setupSupabaseAuth = async (clerkToken: string | null) => {
  if (!clerkToken) {
    console.warn('No Clerk token provided for Supabase authentication');
    return false;
  }

  try {
    // Set the Clerk JWT on the Supabase client
    await supabase.auth.setSession({
      access_token: clerkToken,
      refresh_token: '',
    });
    
    return true;
  } catch (error) {
    console.error('Error setting Supabase session with Clerk token:', error);
    return false;
  }
};

/**
 * Use this function to get data with Clerk auth in components
 * @example
 * const { data, error } = await querySupabaseWithClerk(
 *   async (supabaseClient) => {
 *     return await supabaseClient.from('ideas').select('*');
 *   },
 *   clerkToken
 * );
 */
export const querySupabaseWithClerk = async (
  query: (supabaseClient: any) => Promise<any>,
  clerkToken: string | null
) => {
  // Set up auth with clerk token
  const authSetup = await setupSupabaseAuth(clerkToken);
  
  if (!authSetup) {
    return { 
      data: null, 
      error: { message: 'Failed to authenticate with Supabase using Clerk token' } 
    };
  }
  
  try {
    // Run the query with the authenticated client
    return await query(supabase);
  } catch (error: any) {
    console.error('Error executing Supabase query:', error);
    return { 
      data: null, 
      error: { message: error.message || 'Unknown error occurred' } 
    };
  }
}; 