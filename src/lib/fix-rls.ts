import { supabase } from './supabase';
import { setupSupabaseAuth } from './supabase-clerk-auth';

/**
 * Integrated function to attempt fixing Supabase RLS issues with ideas table
 */
export const fixRlsIssues = async (clerkToken: string | null, userId: string) => {
  // 1. First try to setup auth with the clerk token
  await setupSupabaseAuth(clerkToken);
  
  // 2. Try a standard insert with proper auth
  try {
    const testData = {
      title: `Test Entry ${Date.now()}`,
      description: 'Testing RLS policy configurations',
      user_id: userId,
      validation_score: 5,
      rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('ideas')
      .insert([testData])
      .select('id')
      .single();
    
    if (!error) {
      // Delete the test data if it was created
      if (data?.id) {
        await supabase.from('ideas').delete().eq('id', data.id);
      }
      
      return {
        success: true,
        message: 'RLS policies are working correctly',
        error: null
      };
    }
    
    console.error('Standard insert failed:', error);
    
    // 3. If standard insert fails, try to diagnose what's wrong
    const details = {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    };
    
    // Return diagnostics
    return {
      success: false,
      message: `RLS issue detected: ${error.message}`,
      error: details,
      suggestion: 'Run the SQL in FIX-RLS-POLICIES.sql in your Supabase SQL Editor'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to test RLS policies',
      error: error.message || 'Unknown error'
    };
  }
}; 