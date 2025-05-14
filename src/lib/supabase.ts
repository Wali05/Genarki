import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Schema types for Supabase tables
export type Tables = {
  ideas: {
    id: string;
    title: string;
    description: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    rating: number;
    validation_score: number;
  };
  blueprints: {
    id: string;
    idea_id: string;
    tech_stack: any;
    features: any;
    pricing_model: any;
    user_flow: string;
    tasks: any;
    created_at: string;
    updated_at: string;
  };
}; 