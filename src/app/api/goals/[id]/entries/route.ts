import { NextRequest, NextResponse } from 'next/server'
import { logEntry } from '@/lib/goals'
import { zEntryCreate } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const goalId = parseInt(id, 10)

    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input with Zod
    const validation = zEntryCreate.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      )
    }

    const { delta, notes } = validation.data
    const entry = await logEntry(goalId, {
      delta,
      notes
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}