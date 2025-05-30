import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Map to track active SSE connections per kidId
const connections = new Map<number, Set<ReadableStreamDefaultController>>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> }
) {
  const { kidId: kidIdParam } = await params;
  const kidId = parseInt(kidIdParam, 10);

  if (isNaN(kidId)) {
    return new Response('Invalid kid ID', { status: 400 });
  }

  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the map
      if (!connections.has(kidId)) {
        connections.set(kidId, new Set());
      }
      connections.get(kidId)!.add(controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        connections.get(kidId)?.delete(controller);
        if (connections.get(kidId)?.size === 0) {
          connections.delete(kidId);
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Export a function to broadcast updates to connected clients
export function broadcastFeedbackUpdate(kidId: number, feedback: any) {
  const controllers = connections.get(kidId);
  if (!controllers) return;

  const encoder = new TextEncoder();
  const data = encoder.encode(
    `data: ${JSON.stringify({ type: 'feedback', data: feedback })}\n\n`
  );

  controllers.forEach((controller) => {
    try {
      controller.enqueue(data);
    } catch (error) {
      // Controller might be closed, remove it
      controllers.delete(controller);
    }
  });
}