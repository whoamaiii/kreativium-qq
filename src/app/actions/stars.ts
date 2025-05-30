'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface AwardStarsResult {
  success: boolean
  starsAwarded: number
  totalStars: number
  error?: string
}

/**
 * Awards a star to a kid when their goal reaches 100% completion
 * Idempotent: Only awards one star per goal completion
 */
export async function awardStar(goalId: number): Promise<AwardStarsResult> {
  try {
    // First check if the goal exists and is at 100%
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { kid: true }
    })

    if (!goal) {
      return {
        success: false,
        starsAwarded: 0,
        totalStars: 0,
        error: 'Goal not found'
      }
    }

    if (goal.pct !== 100) {
      return {
        success: false,
        starsAwarded: 0,
        totalStars: goal.kid.stars,
        error: 'Goal is not complete'
      }
    }

    // Check if star was already awarded (idempotency)
    // We'll use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch within transaction to ensure consistency
      const currentGoal = await tx.goal.findUnique({
        where: { id: goalId },
        include: { kid: true }
      })

      if (!currentGoal || currentGoal.pct !== 100) {
        throw new Error('Goal state changed')
      }

      // Calculate how many stars should be awarded
      // We'll check all completed goals to ensure consistency
      const allGoals = await tx.goal.findMany({
        where: { 
          kidId: currentGoal.kidId,
          pct: 100
        }
      })

      const expectedStars = allGoals.length
      const currentStars = currentGoal.kid.stars

      if (currentStars >= expectedStars) {
        // Star already awarded for this goal
        return {
          starsAwarded: 0,
          totalStars: currentStars
        }
      }

      // Award the star
      const updatedKid = await tx.kid.update({
        where: { id: currentGoal.kidId },
        data: { stars: expectedStars }
      })

      return {
        starsAwarded: expectedStars - currentStars,
        totalStars: updatedKid.stars
      }
    })

    // Revalidate the ILP page to show updated stars
    revalidatePath('/ilp')

    return {
      success: true,
      starsAwarded: result.starsAwarded,
      totalStars: result.totalStars
    }
  } catch (error) {
    console.error('Error awarding star:', error)
    return {
      success: false,
      starsAwarded: 0,
      totalStars: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Gets the current star count for a kid
 */
export async function getKidStars(kidId: number): Promise<number> {
  const kid = await prisma.kid.findUnique({
    where: { id: kidId },
    select: { stars: true }
  })

  return kid?.stars ?? 0
}

/**
 * Recalculates stars for a kid based on completed goals
 * Useful for data consistency checks
 */
export async function recalculateStars(kidId: number): Promise<number> {
  const completedGoalsCount = await prisma.goal.count({
    where: {
      kidId,
      pct: 100
    }
  })

  const updatedKid = await prisma.kid.update({
    where: { id: kidId },
    data: { stars: completedGoalsCount }
  })

  revalidatePath('/ilp')
  return updatedKid.stars
}