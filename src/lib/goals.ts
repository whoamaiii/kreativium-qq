import prisma from '@/lib/prisma'

// Constants
const GOAL_COMPLETE = 100
const DEFAULT_STAR_REWARD = 1

// Helper function to clamp values
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export async function createGoal(kidId: number, data: {
  title: string
  desc?: string
}) {
  return await prisma.goal.create({
    data: {
      kidId,
      title: data.title,
      desc: data.desc,
      pct: 0,
      pctComplete: 0
    }
  })
}

export async function updateGoal(id: number, data: {
  title?: string
  desc?: string
  pct?: number
  pctComplete?: number
}) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: { id },
      select: { pctComplete: true, isCompleted: true, kidId: true }
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    // Clamp pctComplete if provided
    const updateData: any = { ...data }
    if (updateData.pctComplete !== undefined) {
      updateData.pctComplete = clamp(updateData.pctComplete, 0, GOAL_COMPLETE)
    }

    const newPct = updateData.pctComplete ?? goal.pctComplete
    const shouldComplete = !goal.isCompleted && newPct === GOAL_COMPLETE
    
    if (shouldComplete) {
      updateData.isCompleted = true
    }

    const updated = await tx.goal.update({
      where: { id },
      data: updateData
    })

    // Award stars if crossing to completion
    if (shouldComplete) {
      await tx.kid.update({
        where: { id: goal.kidId },
        data: {
          stars: {
            increment: DEFAULT_STAR_REWARD
          }
        }
      })
    }

    return updated
  })
}

export async function logEntry(goalId: number, data: {
  delta: number
  notes?: string
}) {
  return await prisma.$transaction(async (tx) => {
    // Get goal info to get kidId and current progress
    const goal = await tx.goal.findUnique({
      where: { id: goalId },
      select: { pctComplete: true, isCompleted: true, kidId: true }
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    // Check if the delta would exceed 100%
    const newPct = clamp(goal.pctComplete + data.delta, 0, GOAL_COMPLETE)
    const maxAllowedDelta = GOAL_COMPLETE - goal.pctComplete
    
    if (data.delta > maxAllowedDelta) {
      throw new Error(`Cannot exceed 100%. Maximum allowed: ${maxAllowedDelta}%`)
    }

    // Check if goal is already completed
    if (goal.isCompleted) {
      throw new Error('Cannot add activity to completed goal')
    }

    const entry = await tx.entry.create({
      data: {
        goalId,
        kidId: goal.kidId,
        activity: 'Progress Update',
        subject: 'General',
        status: 'COMPLETED',
        notes: data.notes,
        delta: data.delta
      }
    })

    const shouldComplete = !goal.isCompleted && newPct === GOAL_COMPLETE
    
    await tx.goal.update({
      where: { id: goalId },
      data: { 
        pctComplete: newPct,
        ...(shouldComplete && { isCompleted: true })
      }
    })

    // Award stars if crossing to completion
    if (shouldComplete) {
      await tx.kid.update({
        where: { id: goal.kidId },
        data: {
          stars: {
            increment: DEFAULT_STAR_REWARD
          }
        }
      })
    }

    return entry
  })
}

export async function awardStars(kidId: number, stars: number) {
  return await prisma.kid.update({
    where: { id: kidId },
    data: {
      stars: {
        increment: stars
      }
    }
  })
}