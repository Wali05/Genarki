import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role key for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create a secure API route that handles all database operations
export async function POST(request: Request) {
  try {
    // Get cookies in an async-safe way
    const cookieStore = cookies();
    
    // Verify authentication using Supabase
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process request
    const { action, table, data } = await request.json();

    // Execute database operation based on action type
    switch (action) {
      case 'insert': {
        // Add user_id to data for all tables that require it
        const dataWithUserId = table === 'ideas' ? { ...data, user_id: userId } : data;
        
        const { data: result, error } = await supabaseAdmin
          .from(table)
          .insert(dataWithUserId)
          .select()
          .single();

        if (error) {
          console.error(`${action} error:`, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
      }

      case 'select': {
        const { select = '*', filters = [] } = data;
        
        // Start building query
        let query = supabaseAdmin
          .from(table)
          .select(select);
        
        // Add filters - this should be handling user-specific data
        if (table === 'ideas') {
          query = query.eq('user_id', userId);
        }
        
        // Add additional filters
        if (filters && filters.length > 0) {
          filters.forEach((filter: { column: string; operator: string; value: any }) => {
            if (filter.operator === 'eq') {
              query = query.eq(filter.column, filter.value);
            } else if (filter.operator === 'neq') {
              query = query.neq(filter.column, filter.value);
            } else if (filter.operator === 'gt') {
              query = query.gt(filter.column, filter.value);
            } else if (filter.operator === 'lt') {
              query = query.lt(filter.column, filter.value);
            } else if (filter.operator === 'gte') {
              query = query.gte(filter.column, filter.value);
            } else if (filter.operator === 'lte') {
              query = query.lte(filter.column, filter.value);
            } else if (filter.operator === 'in') {
              query = query.in(filter.column, filter.value);
            }
          });
        }
        
        const { data: result, error } = await query;
        
        if (error) {
          console.error(`${action} error:`, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
      }

      case 'update': {
        const { id, values } = data;
        
        // Verify ownership for user-specific tables
        if (table === 'ideas') {
          const { data: item, error: checkError } = await supabaseAdmin
            .from(table)
            .select('user_id')
            .eq('id', id)
            .single();
          
          if (checkError || !item || item.user_id !== userId) {
            return NextResponse.json(
              { error: 'Unauthorized or item not found' },
              { status: 403 }
            );
          }
        }
        
        const { data: result, error } = await supabaseAdmin
          .from(table)
          .update(values)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error(`${action} error:`, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
      }

      case 'delete': {
        const { id } = data;
        
        // Verify ownership for user-specific tables
        if (table === 'ideas') {
          const { data: item, error: checkError } = await supabaseAdmin
            .from(table)
            .select('user_id')
            .eq('id', id)
            .single();
          
          if (checkError || !item || item.user_id !== userId) {
            return NextResponse.json(
              { error: 'Unauthorized or item not found' },
              { status: 403 }
            );
          }
        }
        
        const { data: result, error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error(`${action} error:`, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Database API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
