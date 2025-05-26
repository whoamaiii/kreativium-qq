import { describe, it, expect } from 'vitest'
import { zGoalCreate, zGoalUpdate, zEntryCreate } from './validation'

describe('Validation Schemas', () => {
  describe('zGoalCreate', () => {
    it('should validate valid goal creation data', () => {
      const validData = {
        kidId: 1,
        title: 'Test Goal',
        desc: 'Test Description'
      }

      const result = zGoalCreate.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate goal creation without optional desc', () => {
      const validData = {
        kidId: 1,
        title: 'Test Goal'
      }

      const result = zGoalCreate.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        title: 'Test Goal'
        // missing kidId
      }

      const result = zGoalCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['kidId'],
              code: 'invalid_type'
            })
          ])
        )
      }
    })

    it('should reject invalid kidId', () => {
      const invalidData = {
        kidId: -1, // negative
        title: 'Test Goal'
      }

      const result = zGoalCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty title', () => {
      const invalidData = {
        kidId: 1,
        title: '' // empty string
      }

      const result = zGoalCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('zGoalUpdate', () => {
    it('should validate valid goal update data', () => {
      const validData = {
        title: 'Updated Goal',
        desc: 'Updated Description',
        pctComplete: 75
      }

      const result = zGoalUpdate.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate partial updates', () => {
      const validData = {
        pctComplete: 50
      }

      const result = zGoalUpdate.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate empty object', () => {
      const result = zGoalUpdate.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should reject pctComplete out of range', () => {
      const invalidData = {
        pctComplete: 150 // > 100
      }

      const result = zGoalUpdate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative pctComplete', () => {
      const invalidData = {
        pctComplete: -10
      }

      const result = zGoalUpdate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('zEntryCreate', () => {
    it('should validate valid entry creation data', () => {
      const validData = {
        kidId: 1,
        activity: 'Math homework',
        subject: 'Math',
        status: 'completed',
        due: '2024-01-01T10:00:00Z',
        notes: 'Great work!',
        delta: 10
      }

      const result = zEntryCreate.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate entry without optional fields', () => {
      const validData = {
        kidId: 1,
        activity: 'Math homework',
        status: 'completed',
        delta: 10
      }

      const result = zEntryCreate.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        kidId: 1,
        activity: 'Math homework'
        // missing status and delta
      }

      const result = zEntryCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['status']
            }),
            expect.objectContaining({
              path: ['delta']
            })
          ])
        )
      }
    })

    it('should reject invalid kidId', () => {
      const invalidData = {
        kidId: 0, // not positive
        activity: 'Math homework',
        status: 'completed',
        delta: 10
      }

      const result = zEntryCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty activity', () => {
      const invalidData = {
        kidId: 1,
        activity: '', // empty
        status: 'completed',
        delta: 10
      }

      const result = zEntryCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept negative delta', () => {
      const validData = {
        kidId: 1,
        activity: 'Math homework',
        status: 'incomplete',
        delta: -5
      }

      const result = zEntryCreate.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const invalidData = {
        kidId: 1,
        activity: 'Math homework',
        status: 'completed',
        due: 'invalid-date',
        delta: 10
      }

      const result = zEntryCreate.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})