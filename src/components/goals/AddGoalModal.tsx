"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { zGoalCreate } from '@/lib/validation'

interface Goal {
  id: number
  title: string
  desc?: string | null
  pct: number
  pctComplete: number
  isCompleted: boolean
  kidId: number
  createdAt: Date
  updatedAt: Date
}

interface AddGoalModalProps {
  kidId: number
  onClose: () => void
  onGoalAdded: (goal: Goal) => void
}

export default function AddGoalModal({ kidId, onClose, onGoalAdded }: AddGoalModalProps) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      // Validate with Zod
      const goalData = zGoalCreate.parse({
        kidId,
        title: title.trim(),
        desc: desc.trim() || undefined
      })

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 400 && errorData.issues) {
          // Handle Zod validation errors
          const newErrors: Record<string, string> = {}
          errorData.issues.forEach((issue: { path: string[]; message: string }) => {
            if (issue.path.length > 0) {
              newErrors[issue.path[0]] = issue.message
            }
          })
          setErrors(newErrors)
        } else {
          setErrors({ general: errorData.error || 'Failed to create goal' })
        }
        return
      }

      const newGoal = await response.json()
      onGoalAdded(newGoal)
      onClose()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            newErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(newErrors)
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
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
        <h2 className="text-xl font-semibold text-white mb-4">Add New Goal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter goal title"
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-slate-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter goal description"
              disabled={isSubmitting}
            />
            {errors.desc && <p className="text-red-400 text-sm mt-1">{errors.desc}</p>}
          </div>

          {errors.general && (
            <div className="text-red-400 text-sm">{errors.general}</div>
          )}

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
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 