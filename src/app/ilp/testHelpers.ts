import type { Goal, Entry } from '@prisma/client';

// Type aliases to match ILPClient and ILPClientEnhanced
export type GoalData = Goal & { entries: Entry[] };
export type EntryData = Entry;

// Helper functions to create properly typed mock data
export function createMockGoal(overrides: Partial<GoalData> = {}): GoalData {
  return {
    id: 1,
    title: 'Test Goal',
    desc: null,
    pct: 0,
    pctComplete: 0,
    targetXp: 100,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    kidId: 1,
    entries: [],
    ...overrides
  };
}

export function createMockEntry(overrides: Partial<EntryData> = {}): EntryData {
  return {
    id: 1,
    activity: 'Test Activity',
    subject: null,
    status: 'PENDING',
    due: null,
    notes: null,
    delta: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    kidId: 1,
    goalId: 1,
    ...overrides
  };
}