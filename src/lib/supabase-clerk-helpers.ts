import { supabase } from './supabase';
import { setupSupabaseAuth } from './supabase-clerk-auth';
import { prepareIdeaData, prepareBlueprintData } from './supabase-helpers';

/**
 * Save an idea to Supabase with Clerk authentication
 */
export const saveIdeaWithClerkAuth = async (
  title: string,
  description: string,
  userId: string,
  validationScore: number,
  clerkToken: string | null
) => {
  // First set up auth with Clerk token
  const authSetup = await setupSupabaseAuth(clerkToken);
  
  if (!authSetup) {
    return { 
      data: null, 
      error: { 
        message: 'Failed to authenticate with Supabase using Clerk token',
        hint: 'Make sure your Clerk JWT token is correctly configured in Supabase'
      } 
    };
  }
  
  try {
    // Prepare the idea data
    const ideaData = prepareIdeaData(title, description, userId, validationScore);
    
    // Insert the idea
    const { data, error } = await supabase
      .from('ideas')
      .insert([ideaData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving idea with Clerk auth:', error);
      
      // Check if this is likely an RLS issue
      if (error.code === '42501' || error.message.includes('policy')) {
        return {
          data: null,
          error: {
            message: `RLS policy error: ${error.message}`,
            hint: 'Check your Supabase RLS policies for the ideas table',
            original: error
          }
        };
      }
      
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Exception saving idea:', error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Unknown error saving idea',
        original: error
      }
    };
  }
};

/**
 * Save a blueprint to Supabase with Clerk authentication
 */
export const saveBlueprintWithClerkAuth = async (
  ideaId: string,
  blueprint: any,
  clerkToken: string | null
) => {
  // First set up auth with Clerk token
  const authSetup = await setupSupabaseAuth(clerkToken);
  
  if (!authSetup) {
    return { 
      data: null, 
      error: { 
        message: 'Failed to authenticate with Supabase using Clerk token',
        hint: 'Make sure your Clerk JWT token is correctly configured in Supabase'
      } 
    };
  }
  
  try {
    // Prepare the blueprint data
    const blueprintData = prepareBlueprintData(ideaId, blueprint);
    
    // Insert the blueprint
    const { data, error } = await supabase
      .from('blueprints')
      .insert([blueprintData])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving blueprint with Clerk auth:', error);
      
      // Check if this is likely an RLS issue
      if (error.code === '42501' || error.message.includes('policy')) {
        return {
          data: null,
          error: {
            message: `RLS policy error: ${error.message}`,
            hint: 'Check your Supabase RLS policies for the blueprints table',
            original: error
          }
        };
      }
      
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Exception saving blueprint:', error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Unknown error saving blueprint',
        original: error
      }
    };
  }
}; 