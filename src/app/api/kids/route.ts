import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const kids = await prisma.kid.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(kids);
  } catch (error) {
    console.error('Error fetching kids:', error);
    return NextResponse.json({ error: 'Failed to fetch kids' }, { status: 500 });
  }
} 