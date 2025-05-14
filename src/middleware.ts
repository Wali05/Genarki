import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/reset-password',
  '/api/webhooks',
  '/api/auth/callback',
  '/admin',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/feedback'
];

// Define protected API routes
const PROTECTED_API_ROUTES = [
  '/api/database',
  '/api/generate'
];

export async function middleware(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh the session if it exists
  const { data: { session } } = await supabase.auth.getSession();

  // For debugging
  const pathname = req.nextUrl.pathname;
  
  // Check if the current path is an API route that needs protection
  const isProtectedApiRoute = PROTECTED_API_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is in the public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route.endsWith('*')) {
      const baseRoute = route.slice(0, -1);
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route);
  });

  // Special handling for API routes - return 401 for unauthenticated requests
  if (isProtectedApiRoute && !session) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  // If not a public route and no session, redirect to sign-in
  if (!isPublicRoute && !session) {
    const redirectUrl = new URL('/sign-in', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session but user is on a sign-in/sign-up page, redirect to dashboard
  if (session && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
}; 