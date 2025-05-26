import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { awardStar } from '@/app/actions/stars'

export async function GET(
  request: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const goalId = parseInt(params.goalId)
    
    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        kid: {
          select: {
            id: true,
            name: true,
            stars: true
          }
        },
        entries: true
      }
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const goalId = parseInt(params.goalId)
    
    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { pct } = body

    // Validate percentage
    if (typeof pct !== 'number' || pct < 0 || pct > 100) {
      return NextResponse.json(
        { error: 'Invalid percentage value' },
        { status: 400 }
      )
    }

    // Get current goal state
    const currentGoal = await prisma.goal.findUnique({
      where: { id: goalId }
    })

    if (!currentGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { pct: Math.round(pct) },
      include: {
        kid: {
          select: {
            id: true,
            name: true,
            stars: true
          }
        }
      }
    })

    // Award star if goal just reached 100%
    let starResult = null
    if (currentGoal.pct < 100 && updatedGoal.pct === 100) {
      starResult = await awardStar(goalId)
      
      // Refresh the goal data to include updated stars
      if (starResult.success) {
        const refreshedGoal = await prisma.goal.findUnique({
          where: { id: goalId },
          include: {
            kid: {
              select: {
                id: true,
                name: true,
                stars: true
              }
            }
          }
        })
        if (refreshedGoal) {
          updatedGoal.kid = refreshedGoal.kid
        }
      }
    }

    return NextResponse.json({
      goal: updatedGoal,
      starAwarded: starResult?.success && starResult.starsAwarded > 0
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}