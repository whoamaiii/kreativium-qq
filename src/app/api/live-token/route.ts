import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Add basic security check - could add more sophisticated auth here
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', // Added for dev server on port 3001
      'http://localhost:3002', // Added for dev server on port 3002
      'http://localhost:3003', // Added for additional dev server ports
      'http://localhost:3004', // Added for current dev server port
      'https://your-production-domain.com', // Update with your actual domain
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Error in live-token API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 