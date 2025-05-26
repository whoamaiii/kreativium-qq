import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGoal, updateGoal, logEntry, awardStars } from './goals'
import { prisma } from './prisma'

vi.mock('./prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    goal: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    entry: {
      create: vi.fn()
    },
    kid: {
      update: vi.fn()
    }
  }
}))

describe('Goals Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createGoal', () => {
    it('should create a goal with correct data', async () => {
      const mockGoal = {
        id: 1,
        kidId: 1,
        title: 'Test Goal',
        desc: 'Test Description',
        pct: 0,
        pctComplete: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      vi.mocked(prisma.goal.create).mockResolvedValue(mockGoal)

      const result = await createGoal(1, {
        title: 'Test Goal',
        desc: 'Test Description'
      })

      expect(prisma.goal.create).toHaveBeenCalledWith({
        data: {
          kidId: 1,
          title: 'Test Goal',
          desc: 'Test Description',
          pct: 0,
          pctComplete: 0
        }
      })
      expect(result).toEqual(mockGoal)
    })
  })

  describe('updateGoal', () => {
    it('should update a goal without awarding stars', async () => {
      const mockGoal = { id: 1, pctComplete: 50, isCompleted: false, kidId: 1 }
      const updatedGoal = { ...mockGoal, title: 'Updated Goal', pctComplete: 75 }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        const mockTx = {
          goal: {
            findUnique: vi.fn().mockResolvedValue(mockGoal),
            update: vi.fn().mockResolvedValue(updatedGoal)
          },
          kid: {
            update: vi.fn()
          }
        }
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      const result = await updateGoal(1, { title: 'Updated Goal', pctComplete: 75 })

      expect(result).toEqual(updatedGoal)
    })

    it('should award stars when crossing to 100% completion', async () => {
      const mockGoal = { id: 1, pctComplete: 95, isCompleted: false, kidId: 1 }
      const updatedGoal = { ...mockGoal, pctComplete: 100, isCompleted: true }

      const mockTx = {
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal),
          update: vi.fn().mockResolvedValue(updatedGoal)
        },
        kid: {
          update: vi.fn().mockResolvedValue({ id: 1, stars: 1 })
        }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      await updateGoal(1, { pctComplete: 100 })

      expect(mockTx.kid.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stars: { increment: 1 } }
      })
    })

    it('should prevent duplicate star awards when already completed', async () => {
      const mockGoal = { id: 1, pctComplete: 100, isCompleted: true, kidId: 1 }
      const updatedGoal = { ...mockGoal }

      const mockTx = {
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal),
          update: vi.fn().mockResolvedValue(updatedGoal)
        },
        kid: {
          update: vi.fn()
        }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      await updateGoal(1, { pctComplete: 100 })

      expect(mockTx.kid.update).not.toHaveBeenCalled()
    })

    it('should clamp pctComplete values', async () => {
      const mockGoal = { id: 1, pctComplete: 50, isCompleted: false, kidId: 1 }
      const updatedGoal = { ...mockGoal, pctComplete: 100 }

      const mockTx = {
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal),
          update: vi.fn().mockResolvedValue(updatedGoal)
        },
        kid: {
          update: vi.fn()
        }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      await updateGoal(1, { pctComplete: 150 }) // Should be clamped to 100

      expect(mockTx.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pctComplete: 100, isCompleted: true }
      })
    })

    it('should throw error for non-existent goal', async () => {
      const mockTx = {
        goal: {
          findUnique: vi.fn().mockResolvedValue(null)
        }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      await expect(updateGoal(999, { title: 'Test' })).rejects.toThrow('Goal not found')
    })
  })

  describe('logEntry', () => {
    it('should create entry and update goal progress', async () => {
      const mockEntry = {
        id: 1,
        goalId: 1,
        kidId: 1,
        activity: 'Math homework',
        subject: 'Math',
        status: 'completed',
        due: null,
        notes: 'Great work!',
        delta: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockGoal = { id: 1, pctComplete: 80, isCompleted: false, kidId: 1 }

      const mockTx = {
        entry: {
          create: vi.fn().mockResolvedValue(mockEntry)
        },
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal),
          update: vi.fn().mockResolvedValue({ ...mockGoal, pctComplete: 90 })
        },
        kid: {
          update: vi.fn()
        }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      const result = await logEntry(1, {
        kidId: 1,
        activity: 'Math homework',
        subject: 'Math',
        status: 'completed',
        notes: 'Great work!',
        delta: 10
      })

      expect(mockTx.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pctComplete: 90 }
      })
      expect(result).toEqual(mockEntry)
    })

    it('should prevent duplicate awards when toggling 99→100→90→100', async () => {
      const mockEntry = { id: 1, delta: 10 }
      
      // First call: 90 → 100 (should award)
      const mockGoal1 = { id: 1, pctComplete: 90, isCompleted: false, kidId: 1 }
      const mockTx1 = {
        entry: { create: vi.fn().mockResolvedValue(mockEntry) },
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal1),
          update: vi.fn().mockResolvedValue({ ...mockGoal1, pctComplete: 100, isCompleted: true })
        },
        kid: { update: vi.fn().mockResolvedValue({ id: 1, stars: 1 }) }
      }

      // Second call: 100 → 90 (already completed, no award)
      const mockGoal2 = { id: 1, pctComplete: 100, isCompleted: true, kidId: 1 }
      const mockTx2 = {
        entry: { create: vi.fn().mockResolvedValue({ ...mockEntry, delta: -10 }) },
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal2),
          update: vi.fn().mockResolvedValue({ ...mockGoal2, pctComplete: 90 })
        },
        kid: { update: vi.fn() }
      }

      // Third call: 90 → 100 (already completed, no duplicate award)
      const mockGoal3 = { id: 1, pctComplete: 90, isCompleted: true, kidId: 1 }
      const mockTx3 = {
        entry: { create: vi.fn().mockResolvedValue(mockEntry) },
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal3),
          update: vi.fn().mockResolvedValue({ ...mockGoal3, pctComplete: 100 })
        },
        kid: { update: vi.fn() }
      }

      vi.mocked(prisma.$transaction)
        .mockImplementationOnce(async (callback) => await callback(mockTx1))
        .mockImplementationOnce(async (callback) => await callback(mockTx2))
        .mockImplementationOnce(async (callback) => await callback(mockTx3))

      // First completion: should award stars
      await logEntry(1, { kidId: 1, activity: 'Test', status: 'completed', delta: 10 })
      expect(mockTx1.kid.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stars: { increment: 1 } }
      })

      // Decrease progress
      await logEntry(1, { kidId: 1, activity: 'Test', status: 'incomplete', delta: -10 })
      expect(mockTx2.kid.update).not.toHaveBeenCalled()

      // Second completion: should NOT award stars (already completed before)
      await logEntry(1, { kidId: 1, activity: 'Test', status: 'completed', delta: 10 })
      expect(mockTx3.kid.update).not.toHaveBeenCalled()
    })

    it('should clamp pctComplete within 0-100 range', async () => {
      const mockEntry = { id: 1 }
      const mockGoal = { id: 1, pctComplete: 95, isCompleted: false, kidId: 1 }

      const mockTx = {
        entry: { create: vi.fn().mockResolvedValue(mockEntry) },
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal),
          update: vi.fn().mockResolvedValue({ ...mockGoal, pctComplete: 100, isCompleted: true })
        },
        kid: { update: vi.fn().mockResolvedValue({ id: 1, stars: 1 }) }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      await logEntry(1, {
        kidId: 1,
        activity: 'Test',
        status: 'completed',
        delta: 20 // 95 + 20 = 115, should be clamped to 100
      })

      expect(mockTx.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pctComplete: 100, isCompleted: true }
      })
    })

    it('should handle negative delta correctly', async () => {
      const mockEntry = { id: 1 }
      const mockGoal = { id: 1, pctComplete: 10, isCompleted: false, kidId: 1 }

      const mockTx = {
        entry: { create: vi.fn().mockResolvedValue(mockEntry) },
        goal: {
          findUnique: vi.fn().mockResolvedValue(mockGoal),
          update: vi.fn().mockResolvedValue({ ...mockGoal, pctComplete: 0 })
        },
        kid: { update: vi.fn() }
      }

      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx)
      })

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction)

      await logEntry(1, {
        kidId: 1,
        activity: 'Test',
        status: 'incomplete',
        delta: -20 // 10 - 20 = -10, should be clamped to 0
      })

      expect(mockTx.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pctComplete: 0 }
      })
    })
  })

  describe('awardStars', () => {
    it('should increment kid stars', async () => {
      const mockKid = { id: 1, name: 'Test Kid', stars: 5 }
      vi.mocked(prisma.kid.update).mockResolvedValue(mockKid)

      const result = await awardStars(1, 2)

      expect(prisma.kid.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { stars: { increment: 2 } }
      })
      expect(result).toEqual(mockKid)
    })
  })
})