import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { broadcastFeedbackUpdate } from './stream/route';

// Real-time updates can be implemented using:
// 1. Server-Sent Events (SSE) for unidirectional updates
// 2. WebSockets through a separate server
// 3. Polling on the client side
// 4. Using Next.js App Router streaming responses

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

    const feedback = await prisma.feedback.findMany({
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

    const feedback = await prisma.feedback.create({
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

    // Broadcast the update via Server-Sent Events
    broadcastFeedbackUpdate(kidId, feedback);

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
} 