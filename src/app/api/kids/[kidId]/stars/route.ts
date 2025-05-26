import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { kidId: string } }
) {
  try {
    const kidId = parseInt(params.kidId)
    
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