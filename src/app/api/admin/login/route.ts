import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValidAdmin = await validateAdminCredentials(username, password);

    if (!isValidAdmin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set a cookie for admin session
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Set session cookie
    response.cookies.set({
      name: 'admin-session',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 