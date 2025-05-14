import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Create a Supabase client using the cookies from the request
    const supabase = createRouteHandlerClient({ cookies });
    
    // Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Get the redirect URL or default to the home page
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';
  
  // Redirect to the specified URL
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
} 