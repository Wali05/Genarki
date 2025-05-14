import { NextRequest, NextResponse } from 'next/server';
import { generateIdea } from '@/lib/gemini';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be logged in to use this API' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { title, description } = await request.json();
    
    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Generate idea using Gemini API
    const result = await generateIdea(title, description);
    
    // Return the generated result
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error('Error in generate API route:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate idea' },
      { status: 500 }
    );
  }
}
