'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { awardStar } from './stars'

export interface UpdateGoalProgressResult {
  success: boolean
  goal?: {
    id: number
    pct: number
  }
  starsAwarded?: number
  error?: string
}

/**
 * Updates a goal's progress percentage and awards stars if it reaches 100%
 */
export async function updateGoalProgress(
  goalId: number, 
  newPercentage: number
): Promise<UpdateGoalProgressResult> {
  try {
    // Validate percentage
    if (newPercentage < 0 || newPercentage > 100) {
      return {
        success: false,
        error: 'Percentage must be between 0 and 100'
      }
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { pctComplete: Math.round(newPercentage) }
    })

    let starsAwarded = 0

    // If goal reached 100%, award a star
    if (updatedGoal.pctComplete === 100) {
      const starResult = await awardStar(goalId)
      if (starResult.success) {
        starsAwarded = starResult.starsAwarded
      }
    }

    // Revalidate the ILP page
    revalidatePath('/ilp')

    return {
      success: true,
      goal: {
        id: updatedGoal.id,
        pct: updatedGoal.pctComplete
      },
      starsAwarded
    }
  } catch (error) {
    console.error('Error updating goal progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Creates a new goal for a kid
 */
export async function createGoal(
  kidId: number,
  title: string,
  desc: string
) {
  try {
    const goal = await prisma.goal.create({
      data: {
        kidId,
        title,
        desc,
        pct: 0,
        pctComplete: 0
      }
    })

    revalidatePath('/ilp')
    return { success: true, goal }
  } catch (error) {
    console.error('Error creating goal:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}