"use client"

import React, { useState } from 'react'

interface Goal {
  id: number
  title: string
  desc?: string | null
  pctComplete: number
}

interface GoalCardProps {
  goal: Goal
  onUpdate?: () => void
}

export default function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPercentage, setNewPercentage] = useState(goal.pctComplete.toString())
  const [isUpdating, setIsUpdating] = useState(false)

  // Determine progress bar color based on percentage
  const getProgressBarColor = () => {
    if (goal.pctComplete < 50) return 'bg-green-500'
    if (goal.pctComplete < 100) return 'bg-yellow-500'
    return 'bg-purple-500'
  }

  const getProgressTextColor = () => {
    if (goal.pctComplete < 50) return 'text-green-400'
    if (goal.pctComplete < 100) return 'text-yellow-400'
    return 'text-purple-400'
  }

  const handleUpdateProgress = async () => {
    const percentage = parseInt(newPercentage, 10)
    
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert('Please enter a valid percentage between 0 and 100')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pctComplete: percentage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update goal')
      }

      // Close modal and refresh parent if callback provided
      setIsModalOpen(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      alert('Failed to update goal progress')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="bg-slate-700/50 p-4 rounded-lg shadow-lg border border-slate-600/30">
        <h3 className="font-medium text-lg mb-1 text-white">{goal.title}</h3>
        {goal.desc && (
          <p className="text-slate-300 text-sm mb-3">{goal.desc}</p>
        )}
        
        {/* Progress Bar - Clickable */}
        <div 
          className="cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-400">Progress</span>
            <span className={`text-sm font-medium ${getProgressTextColor()}`}>
              {goal.pctComplete}%
              {goal.pctComplete === 100 && ' Completed'}
            </span>
          </div>
          
          <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden hover:ring-2 hover:ring-slate-500 transition-all">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${goal.pctComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modal for updating progress */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw] border border-slate-600">
            <h2 className="text-xl font-semibold mb-4 text-white">Update Progress</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Goal: {goal.title}
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newPercentage}
                  onChange={(e) => setNewPercentage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isUpdating}
                />
                <span className="text-slate-400">%</span>
              </div>
              
              {/* Progress preview */}
              <div className="mt-3">
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      parseInt(newPercentage) < 50 ? 'bg-green-500' :
                      parseInt(newPercentage) < 100 ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, parseInt(newPercentage) || 0))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProgress}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 