import { NextRequest, NextResponse } from 'next/server';

// Helper to fetch Socket.IO instance
async function initializeSocketIO() {
  try {
    // Make a request to initialize Socket.IO if not already done
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'}/api/socketio`);
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
  }
}

// Internal API endpoint for broadcasting WebSocket messages
// This is called by other API routes when they need to broadcast updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kidId, event, data } = body;

    if (!kidId || !event || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: kidId, event, data' },
        { status: 400 }
      );
    }

    // Ensure Socket.IO is initialized
    await initializeSocketIO();

    // Log the broadcast (in production, this would send to Socket.IO)
    console.log(`Broadcasting to kid-${kidId}:`, { event, data });

    // Note: In a production setup, we would:
    // 1. Use Redis pub/sub to communicate with Socket.IO server
    // 2. Or have Socket.IO server expose an HTTP endpoint to receive broadcasts
    // 3. Or use a shared database/queue for real-time updates
    
    // For now, the actual broadcasting happens through the Socket.IO server
    // when clients directly emit events

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast' },
      { status: 500 }
    );
  }
} 