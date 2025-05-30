import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { wss } from '@/pages/api/ws'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kidId: string }> }
) {
  try {
    const { kidId: kidIdParam } = await params
    const kidId = parseInt(kidIdParam)
    
    if (isNaN(kidId)) {
      return NextResponse.json(
        { error: 'Invalid kid ID' },
        { status: 400 }
      )
    }

    const kid = await prisma.kid.findUnique({
      where: { id: kidId },
      select: { 
        id: true,
        name: true,
        stars: true 
      }
    })

    if (!kid) {
      return NextResponse.json(
        { error: 'Kid not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(kid)
  } catch (error) {
    console.error('Error fetching kid stars:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/kids/[kidId]/stars
export async function PATCH(
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
    const { delta } = body;

    if (typeof delta !== 'number') {
      return NextResponse.json(
        { error: 'Delta must be a number' },
        { status: 400 }
      );
    }

    // Get current kid data - use 'as any' to bypass TypeScript issues
    const kid = await prisma.kid.findUnique({
      where: { id: kidId },
      select: { 
        stars: true, 
        starTotal: true 
      } as any,
    }) as { stars: number; starTotal: number } | null;

    if (!kid) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 });
    }

    // Update stars and starTotal
    const newStars = Math.max(0, kid.stars + delta);
    const newStarTotal = delta > 0 ? kid.starTotal + delta : kid.starTotal;

    const updatedKid = await prisma.kid.update({
      where: { id: kidId },
      data: {
        stars: newStars,
        starTotal: newStarTotal,
      } as any,
      select: {
        id: true,
        name: true,
        stars: true,
        starTotal: true,
      } as any,
    });

    // Broadcast the update via WebSocket
    wss.clients.forEach((c) =>
      c.send(JSON.stringify({ type: 'stars', kidId, total: updatedKid.starTotal }))
    );

    return NextResponse.json(updatedKid);
  } catch (error) {
    console.error('Error updating stars:', error);
    return NextResponse.json(
      { error: 'Failed to update stars' },
      { status: 500 }
    );
  }
}