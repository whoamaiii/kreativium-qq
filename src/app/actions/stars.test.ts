import { describe, it, expect, vi, beforeEach } from 'vitest'
import { awardStar, getKidStars, recalculateStars } from './stars'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    $transaction: vi.fn(),
    goal: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn()
    },
    kid: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
  
  return {
    default: mockPrisma,
    prisma: mockPrisma
  }
})

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Star Awarding System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('awardStar', () => {
    it('should award a star when goal reaches 100%', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: null,
        pct: 100,
        pctComplete: 100,
        targetXp: 100,
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        kid: { id: 1, name: 'Test Kid', stars: 0 }
      }

      const mockTransaction = vi.fn().mockImplementation(async (fn) => {
        const tx = {
          goal: {
            findUnique: vi.fn().mockResolvedValue(mockGoal),
            findMany: vi.fn().mockResolvedValue([mockGoal])
          },
          kid: {
            update: vi.fn().mockResolvedValue({ ...mockGoal.kid, stars: 1 })
          }
        }
        return fn(tx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const result = await awardStar(1)

      expect(result.success).toBe(true)
      expect(result.starsAwarded).toBe(1)
      expect(result.totalStars).toBe(1)
    })

    it('should not award a star if goal is not at 100%', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: null,
        pct: 75,
        pctComplete: 75,
        targetXp: 100,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        kid: { id: 1, name: 'Test Kid', stars: 0 }
      }

      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const result = await awardStar(1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Goal is not complete')
      expect(result.starsAwarded).toBe(0)
    })

    it('should be idempotent - not award duplicate stars', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: null,
        pct: 100,
        pctComplete: 100,
        targetXp: 100,
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        kid: { id: 1, name: 'Test Kid', stars: 1 }
      }

      const mockTransaction = vi.fn().mockImplementation(async (fn) => {
        const tx = {
          goal: {
            findUnique: vi.fn().mockResolvedValue(mockGoal),
            findMany: vi.fn().mockResolvedValue([mockGoal]) // 1 completed goal
          },
          kid: {
            update: vi.fn().mockResolvedValue(mockGoal.kid)
          }
        }
        return fn(tx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const result = await awardStar(1)

      expect(result.success).toBe(true)
      expect(result.starsAwarded).toBe(0) // No new stars awarded
      expect(result.totalStars).toBe(1)
    })

    it('should handle goal not found', async () => {
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(null)

      const result = await awardStar(999)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Goal not found')
    })

    it('should handle multiple completed goals correctly', async () => {
      const mockGoal = {
        id: 3,
        kidId: 1,
        title: 'Test Goal',
        desc: null,
        pct: 100,
        pctComplete: 100,
        targetXp: 100,
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        kid: { id: 1, name: 'Test Kid', stars: 2 }
      }

      const mockTransaction = vi.fn().mockImplementation(async (fn) => {
        const tx = {
          goal: {
            findUnique: vi.fn().mockResolvedValue(mockGoal),
            findMany: vi.fn().mockResolvedValue([
              { id: 1, pct: 100 },
              { id: 2, pct: 100 },
              { id: 3, pct: 100 }
            ])
          },
          kid: {
            update: vi.fn().mockResolvedValue({ ...mockGoal.kid, stars: 3 })
          }
        }
        return fn(tx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)
      vi.mocked(prisma.goal.findUnique).mockResolvedValue(mockGoal)

      const result = await awardStar(3)

      expect(result.success).toBe(true)
      expect(result.starsAwarded).toBe(1) // 3 - 2 = 1 new star
      expect(result.totalStars).toBe(3)
    })
  })

  describe('getKidStars', () => {
    it('should return the star count for a kid', async () => {
      vi.mocked(prisma.kid.findUnique).mockResolvedValue({
        id: 1,
        name: 'Test Kid',
        stars: 5,
        starTotal: 5
      })

      const stars = await getKidStars(1)
      expect(stars).toBe(5)
    })

    it('should return 0 if kid not found', async () => {
      vi.mocked(prisma.kid.findUnique).mockResolvedValue(null)

      const stars = await getKidStars(999)
      expect(stars).toBe(0)
    })
  })

  describe('recalculateStars', () => {
    it('should recalculate stars based on completed goals', async () => {
      vi.mocked(prisma.goal.count).mockResolvedValue(4)
      vi.mocked(prisma.kid.update).mockResolvedValue({
        id: 1,
        name: 'Test Kid',
        stars: 4,
        starTotal: 4
      })

      const stars = await recalculateStars(1)
      
      expect(stars).toBe(4)
      expect(prisma.goal.count).toHaveBeenCalledWith({
        where: { kidId: 1, pct: 100 }
      })
      expect(prisma.kid.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stars: 4 }
      })
    })
  })
})