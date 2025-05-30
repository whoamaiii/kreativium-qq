import { NextRequest, NextResponse } from 'next/server'
import { updateGoal } from '@/lib/goals'
import { zGoalUpdate } from '@/lib/validation'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const goalId = parseInt(id, 10)

    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { entries: true }
    })

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error fetching goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const goalId = parseInt(id, 10)

    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input with Zod
    const validation = zGoalUpdate.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      )
    }

    const goal = await updateGoal(goalId, validation.data)

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof Error && error.message === 'Goal not found') {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }
    
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}