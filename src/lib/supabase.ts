import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Standard client (used for non-auth operations)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
});

// Client components should use this for auth operations
export const createBrowserClient = () => {
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey,
  });
};

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
    features: any;
    market: any;
    technical: any;
    validation: any;
    userflow: any;
    tasks: any;
    created_at: string;
    updated_at: string;
  };
}; 