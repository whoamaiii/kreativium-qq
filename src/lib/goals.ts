import { prisma } from '@/lib/prisma'

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
    const updateData = { ...data }
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
  kidId: number
  activity: string
  subject?: string
  status: string
  due?: Date
  notes?: string
  delta: number
}) {
  return await prisma.$transaction(async (tx) => {
    const entry = await tx.entry.create({
      data: {
        goalId,
        kidId: data.kidId,
        activity: data.activity,
        subject: data.subject,
        status: data.status,
        due: data.due,
        notes: data.notes,
        delta: data.delta
      }
    })

    // Update goal pctComplete based on delta
    const goal = await tx.goal.findUnique({
      where: { id: goalId },
      select: { pctComplete: true, isCompleted: true, kidId: true }
    })

    if (goal) {
      const newPct = clamp(goal.pctComplete + data.delta, 0, GOAL_COMPLETE)
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