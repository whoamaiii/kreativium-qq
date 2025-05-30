import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateGoalProgress, createGoal } from './goals'
import { awardStar } from './stars'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    goal: {
      update: vi.fn(),
      create: vi.fn()
    }
  }
  
  return {
    default: mockPrisma,
    prisma: mockPrisma
  }
})

vi.mock('./stars', () => ({
  awardStar: vi.fn()
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Goal Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateGoalProgress', () => {
    it('should update goal progress successfully', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: 'Test Description',
        pct: 75,
        pctComplete: 75,
        targetXp: 100,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(prisma.goal.update).mockResolvedValue(mockGoal)

      const result = await updateGoalProgress(1, 75)

      expect(result.success).toBe(true)
      expect(result.goal?.pct).toBe(75)
      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pctComplete: 75 }
      })
    })

    it('should award star when goal reaches 100%', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: 'Test Description',
        pct: 100,
        pctComplete: 100,
        targetXp: 100,
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(prisma.goal.update).mockResolvedValue(mockGoal)
      vi.mocked(awardStar).mockResolvedValue({
        success: true,
        starsAwarded: 1,
        totalStars: 1
      })

      const result = await updateGoalProgress(1, 100)

      expect(result.success).toBe(true)
      expect(result.goal?.pct).toBe(100)
      expect(result.starsAwarded).toBe(1)
      expect(awardStar).toHaveBeenCalledWith(1)
    })

    it('should not award star when goal is below 100%', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: 'Test Description',
        pct: 95,
        pctComplete: 95,
        targetXp: 100,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(prisma.goal.update).mockResolvedValue(mockGoal)

      const result = await updateGoalProgress(1, 95)

      expect(result.success).toBe(true)
      expect(result.starsAwarded).toBe(0)
      expect(awardStar).not.toHaveBeenCalled()
    })

    it('should validate percentage bounds', async () => {
      const result1 = await updateGoalProgress(1, -10)
      expect(result1.success).toBe(false)
      expect(result1.error).toBe('Percentage must be between 0 and 100')

      const result2 = await updateGoalProgress(1, 150)
      expect(result2.success).toBe(false)
      expect(result2.error).toBe('Percentage must be between 0 and 100')
    })

    it('should round percentage to nearest integer', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: 'Test Description',
        pct: 76,
        pctComplete: 76,
        targetXp: 100,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(prisma.goal.update).mockResolvedValue(mockGoal)

      await updateGoalProgress(1, 75.6)

      expect(prisma.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pctComplete: 76 }
      })
    })
  })

  describe('createGoal', () => {
    it('should create a new goal successfully', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'New Goal',
        desc: 'Goal Description',
        pct: 0,
        pctComplete: 0,
        targetXp: 100,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(mockGoal)

      const result = await createGoal(1, 'New Goal', 'Goal Description')

      expect(result.success).toBe(true)
      expect(result.goal).toEqual(mockGoal)
      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: {
          kidId: 1,
          title: 'New Goal',
          desc: 'Goal Description',
          pct: 0,
          pctComplete: 0
        }
      })
    })

    it('should handle creation errors', async () => {
      vi.mocked(prisma.goal.create).mockRejectedValue(new Error('Database error'))

      const result = await createGoal(1, 'New Goal', 'Goal Description')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })
})