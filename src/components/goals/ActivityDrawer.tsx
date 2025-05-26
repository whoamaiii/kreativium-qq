"use client"

import React, { useState } from 'react'
import { zEntryCreate } from '@/lib/validation'

interface ToastProps {
  type: 'success' | 'error'
  title: string
  message: string
}

interface ActivityDrawerProps {
  goalId: string | number
  onClose: () => void
  onActivityAdded: (goalId: string | number, updatedGoal: { pctComplete: number; isCompleted: boolean }) => void
}

// Mock toast context for now - will be replaced with actual context
const useToast = () => ({
  showToast: (toast: ToastProps) => {
    // Simple alert for now - in real app this would use a toast library
    const prefix = toast.type === 'success' ? '✅' : '❌'
    alert(`${prefix} ${toast.title}: ${toast.message}`)
  }
})

export default function ActivityDrawer({ goalId, onClose, onActivityAdded }: ActivityDrawerProps) {
  const [notes, setNotes] = useState('')
  const [delta, setDelta] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!notes.trim()) {
      newErrors.notes = 'Activity notes are required'
    }
    
    const deltaNum = parseInt(delta, 10)
    if (!delta || isNaN(deltaNum) || deltaNum < 1 || deltaNum > 100) {
      newErrors.delta = 'Progress must be between 1 and 100'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Step 1: Create the entry
      const entryData = zEntryCreate.parse({
        delta: parseInt(delta, 10),
        notes: notes.trim()
      })

      const entryResponse = await fetch(`/api/goals/${goalId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      })

      if (!entryResponse.ok) {
        const errorData = await entryResponse.json()
        if (entryResponse.status === 400) {
          showToast({
            type: 'error',
            title: 'Validation Error',
            message: errorData.error || 'Invalid request',
          })
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to save activity. Please try again.',
          })
        }
        return
      }

      // Step 2: Get the updated goal to return the new state
      const goalResponse = await fetch(`/api/goals/${goalId}`)
      if (!goalResponse.ok) {
        throw new Error('Failed to fetch updated goal')
      }

      const updatedGoal = await goalResponse.json()

      showToast({
        type: 'success',
        title: 'Activity Added',
        message: `Goal progress updated to ${updatedGoal.pctComplete}%`,
      })

      onActivityAdded(goalId, {
        pctComplete: updatedGoal.pctComplete,
        isCompleted: updatedGoal.isCompleted
      })
      onClose()
    } catch (error) {
      console.error('Error saving activity:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save activity. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-white mb-4">Add Activity</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">
              Activity Notes *
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe what you accomplished"
              disabled={isSubmitting}
            />
            {errors.notes && <p className="text-red-400 text-sm mt-1">{errors.notes}</p>}
          </div>

          <div>
            <label htmlFor="delta" className="block text-sm font-medium text-slate-300 mb-1">
              Progress Increase (%) *
            </label>
            <input
              type="number"
              id="delta"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              min="1"
              max="100"
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter progress increase"
              disabled={isSubmitting}
            />
            {errors.delta && <p className="text-red-400 text-sm mt-1">{errors.delta}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 