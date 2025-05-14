import { supabase } from './supabase';

/**
 * Tests basic Supabase connectivity and returns connection status
 */
export const testSupabaseConnection = async () => {
  try {
    // Try a simple query to verify connection
    const { data, error } = await supabase
      .from('ideas')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return {
      connected: true,
      error: null,
      message: 'Connected to Supabase successfully'
    };
  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    return {
      connected: false,
      error,
      message: error?.message || 'Failed to connect to Supabase'
    };
  }
};

/**
 * Verifies if the required tables exist with proper structure
 */
export const verifyTableStructure = async () => {
  try {
    // Check ideas table
    const { data: ideasData, error: ideasError } = await supabase
      .from('ideas')
      .select('id')
      .limit(1);
    
    if (ideasError) throw new Error(`Ideas table error: ${ideasError.message}`);
    
    // Check blueprints table
    const { data: blueprintsData, error: blueprintsError } = await supabase
      .from('blueprints')
      .select('id')
      .limit(1);
    
    if (blueprintsError) throw new Error(`Blueprints table error: ${blueprintsError.message}`);
    
    return {
      success: true,
      message: 'Table structure verified'
    };
  } catch (error: any) {
    console.error('Table structure verification failed:', error);
    return {
      success: false,
      message: error?.message || 'Failed to verify table structure',
      error
    };
  }
};

/**
 * Attempts to save a test record to check RLS policies
 */
export const testPermissions = async (userId: string) => {
  try {
    // Create test data
    const testId = `test_${Date.now()}`;
    const testData = {
      id: testId,
      title: `Test Record ${Date.now()}`,
      description: 'This is a test record to verify RLS policies',
      user_id: userId,
      validation_score: 5,
      rating: 0,
      created_at: new Date().toISOString()
    };
    
    // Try to insert
    const { error } = await supabase
      .from('ideas')
      .insert([testData]);
    
    if (error) throw error;
    
    // If successful, delete the test record
    await supabase
      .from('ideas')
      .delete()
      .eq('id', testId);
    
    return {
      success: true,
      message: 'Permission check passed'
    };
  } catch (error: any) {
    console.error('Permission test failed:', error);
    return {
      success: false,
      message: error?.message || 'Failed to verify permissions',
      error
    };
  }
};

/**
 * Prepares idea data for insert by handling validation
 */
export const prepareIdeaData = (title: string, description: string, userId: string, validationScore: number) => {
  // Validate and clean input
  const cleanTitle = (title || '').substring(0, 255).trim();
  const cleanDescription = (description || '').trim();
  const cleanScore = isNaN(validationScore) ? 5 : Math.min(Math.max(validationScore, 0), 10);
  
  if (!cleanTitle) throw new Error('Title is required');
  if (!cleanDescription) throw new Error('Description is required');
  if (!userId) throw new Error('User ID is required');
  
  // Return properly formatted data
  return {
    title: cleanTitle,
    description: cleanDescription,
    user_id: userId,
    validation_score: cleanScore,
    rating: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Prepares blueprint data for insert
 */
export const prepareBlueprintData = (ideaId: string, blueprint: any) => {
  if (!ideaId) throw new Error('Idea ID is required');
  
  // Ensure each object is converted to text for Supabase
  return {
    idea_id: ideaId,
    tech_stack: typeof blueprint.techStack === 'object' 
      ? JSON.stringify(blueprint.techStack || {}) 
      : blueprint.techStack || null,
    features: typeof blueprint.features === 'object'
      ? JSON.stringify(blueprint.features || {})
      : blueprint.features || null,
    pricing_model: typeof blueprint.pricingModel === 'object'
      ? JSON.stringify(blueprint.pricingModel || {})
      : blueprint.pricingModel || null,
    user_flow: blueprint.userFlow || '',
    tasks: typeof blueprint.tasks === 'object'
      ? JSON.stringify(blueprint.tasks || [])
      : blueprint.tasks || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}; 