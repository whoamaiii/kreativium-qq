import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wss } from '@/pages/api/ws';

// Since we can't access the Socket.IO server directly from App Router,
// we'll need to implement a different approach for real-time updates.
// For now, we'll keep the standard REST endpoints and rely on client-side polling
// or Server-Sent Events for real-time updates.

// GET /api/kids/[kidId]/feedback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> }
) {
  try {
    const { kidId: kidIdParam } = await params;
    const kidId = parseInt(kidIdParam, 10);

    if (isNaN(kidId)) {
      return NextResponse.json({ error: 'Invalid kid ID' }, { status: 400 });
    }

    const feedback = await (prisma as any).feedback.findMany({
      where: { kidId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST /api/kids/[kidId]/feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> }
) {
  try {
    const { kidId: kidIdParam } = await params;
    const kidId = parseInt(kidIdParam, 10);

    if (isNaN(kidId)) {
      return NextResponse.json({ error: 'Invalid kid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { content, role } = body;

    if (!content || !role) {
      return NextResponse.json(
        { error: 'Content and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'assistant' && role !== 'user') {
      return NextResponse.json(
        { error: 'Role must be "assistant" or "user"' },
        { status: 400 }
      );
    }

    const feedback = await (prisma as any).feedback.create({
      data: {
        kidId,
        content,
        role,
      },
      select: {
        id: true,
        content: true,
        role: true,
        createdAt: true,
      },
    });

    // Broadcast the new feedback via WebSocket
    wss.clients.forEach((c) =>
      c.send(JSON.stringify({ type: 'feedback', kidId, msg: feedback }))
    );

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
} 