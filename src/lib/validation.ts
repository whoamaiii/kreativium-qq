import { z } from 'zod'

// Goal validation schemas
export const zGoalCreate = z.object({
  kidId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  desc: z.string().optional()
})

export const zGoalUpdate = z.object({
  title: z.string().min(1).max(255).optional(),
  desc: z.string().optional(),
  pctComplete: z.number().int().min(0).max(100).optional()
})

// Entry validation schemas
export const zEntryCreate = z.object({
  delta: z.number().int(),
  notes: z.string().optional()
})

export type GoalCreateData = z.infer<typeof zGoalCreate>
export type GoalUpdateData = z.infer<typeof zGoalUpdate>
export type EntryCreateData = z.infer<typeof zEntryCreate>