import { supabase } from './supabase';

/**
 * EMERGENCY HELPER: This function creates a temporary bypass for RLS
 * Do NOT use this in production permanently! Once your RLS is properly configured, remove this.
 */
export const temporarilyDisableRLS = async () => {
  try {
    // This requires a service_role key, not anon key
    const { error: ideasError } = await supabase.rpc('disable_rls_for_ideas');
    const { error: blueprintsError } = await supabase.rpc('disable_rls_for_blueprints');
    
    if (ideasError || blueprintsError) {
      console.error("Error disabling RLS", { ideasError, blueprintsError });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to disable RLS:", error);
    return false;
  }
};

/**
 * Emergency insert function for testing - bypasses RLS policies
 * Use this ONLY for debugging, then implement proper RLS policies
 */
export const forceInsertIdea = async (ideaData: any) => {
  try {
    // First try a direct insert (this will likely fail due to RLS)
    const { data, error } = await supabase
      .from('ideas')
      .insert([ideaData])
      .select('id')
      .single();
    
    if (!error) {
      console.log("Insert succeeded. Your RLS policies must be working!");
      return { data, error: null };
    }
    
    // Log the error for debugging
    console.error("Direct insert failed due to RLS:", error);
    
    // Return failure information for user
    return { 
      data: null, 
      error: {
        message: error.message,
        hint: "Looks like a RLS policy issue. Check SUPABASE-SETUP.md for policy setup instructions."
      } 
    };
  } catch (error: any) {
    return { data: null, error };
  }
};

/**
 * Creates a function in your Supabase database to allow temporary RLS disabling 
 * for debugging purposes. Run this SQL in your Supabase SQL editor:
 */
export const getRLSBypassSQL = () => {
  return `
-- WARNING: This is for development/debugging only
-- These functions allow disabling RLS temporarily

-- Function to disable RLS for ideas table
CREATE OR REPLACE FUNCTION disable_rls_for_ideas()
RETURNS void AS $$
BEGIN
  ALTER TABLE ideas DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disable RLS for blueprints table
CREATE OR REPLACE FUNCTION disable_rls_for_blueprints()
RETURNS void AS $$
BEGIN
  ALTER TABLE blueprints DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to re-enable RLS for ideas table
CREATE OR REPLACE FUNCTION enable_rls_for_ideas()
RETURNS void AS $$
BEGIN
  ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to re-enable RLS for blueprints table
CREATE OR REPLACE FUNCTION enable_rls_for_blueprints()
RETURNS void AS $$
BEGIN
  ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
}; 